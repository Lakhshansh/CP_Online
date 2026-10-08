document.addEventListener("DOMContentLoaded", async () => {
  const rawUser = localStorage.getItem("currentUser");
  let user = null;
  if (rawUser) {
    try { user = JSON.parse(rawUser); } catch (e) { user = null; }
  }

  if (!user) {
    window.location.href = "./index.html";
    return;
  }

  // Populate Navbar
  if (typeof renderNavbarUser === "function") {
    renderNavbarUser(user);
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try { await apiRequest("/api/logout", { method: "POST" }); } catch (e) {}
      localStorage.removeItem("currentUser");
      window.location.href = "./index.html";
    });
  }

  // Set default dates
  const today = new Date().toISOString().split("T")[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sDateInput = document.getElementById("aStartDate");
  const eDateInput = document.getElementById("aEndDate");
  if (sDateInput) sDateInput.value = today;
  if (eDateInput) eDateInput.value = nextMonth;

  // Populate Dropdowns
  await loadDropdownData(user);

  // Load Assignments Table
  await loadAssignments();

  // Handle Form Submit
  const addForm = document.getElementById("addAssignForm");
  const alertEl = document.getElementById("assignAlert");
  const addBtn = document.getElementById("btnAddAssign");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const patient_id = document.getElementById("aPatient").value;
      const therapist_id = document.getElementById("aTherapist").value;
      const exercise_id = document.getElementById("aExercise").value;
      const difficulty = document.getElementById("aDifficulty").value;
      const target_type = document.getElementById("aTargetType").value;
      const target_value = parseInt(document.getElementById("aTargetValue").value, 10);
      const frequency = document.getElementById("aFrequency").value;
      const start_date = document.getElementById("aStartDate").value;
      const end_date = document.getElementById("aEndDate").value;
      const status = document.getElementById("aStatus").value;
      const notes = document.getElementById("aNotes").value.trim();

      if (!patient_id || !therapist_id || !exercise_id || !start_date || !end_date) {
        showPageAlert("Please fill in all required fields.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Assigning...";

      try {
        const res = await apiRequest("/api/exercise-assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id,
            therapist_id,
            exercise_id,
            difficulty,
            target_type,
            target_value,
            frequency,
            start_date,
            end_date,
            status,
            notes,
            user_id: user.user_id
          })
        });

        showPageAlert(res.message || "Exercise assigned successfully!", "success");

        document.getElementById("aPatient").value = "";
        document.getElementById("aTherapist").value = "";
        document.getElementById("aExercise").value = "";
        document.getElementById("aNotes").value = "";

        await loadAssignments();
      } catch (err) {
        showPageAlert(err.message || "Failed to assign exercise.", "danger");
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = "+ Assign Exercise";
      }
    });
  }

  function showPageAlert(message, type = "success") {
    if (!alertEl) return;
    alertEl.hidden = false;
    alertEl.className = `alert alert-${type} mb-3`;
    alertEl.textContent = message;
    setTimeout(() => { alertEl.hidden = true; }, 4000);
  }
});

async function loadDropdownData(user) {
  try {
    const [pRes, tRes, eRes] = await Promise.all([
      apiRequest(`/api/patients?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`).catch(() => ({ patients: [] })),
      apiRequest(`/api/therapists?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`).catch(() => ({ therapists: [] })),
      apiRequest("/api/exercises").catch(() => ({ exercises: [] }))
    ]);

    const pSelect = document.getElementById("aPatient");
    if (pSelect && pRes.patients) {
      pSelect.innerHTML = `<option value="" disabled selected>Select patient</option>` +
        pRes.patients.map(p => `<option value="${p.patient_id}">${escapeHtml(p.name)}</option>`).join("");
    }

    const tSelect = document.getElementById("aTherapist");
    if (tSelect && tRes.therapists) {
      tSelect.innerHTML = `<option value="" disabled selected>Select therapist</option>` +
        tRes.therapists.map(t => `<option value="${t.therapist_id}">${escapeHtml(t.name)}</option>`).join("");
    }

    const eSelect = document.getElementById("aExercise");
    if (eSelect && eRes.exercises) {
      eSelect.innerHTML = `<option value="" disabled selected>Select exercise</option>` +
        eRes.exercises.map(e => `<option value="${e.exercise_id}">${escapeHtml(e.exercise_name)}</option>`).join("");
    }
  } catch (err) {
    console.error("Failed to populate dropdowns:", err);
  }
}

async function loadAssignments() {
  const tbody = document.getElementById("assignTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/exercise-assignments?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const assignments = (res && res.assignments) ? res.assignments : [];

    if (assignments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-4">No exercise assignments found.</td></tr>`;
      return;
    }

    tbody.innerHTML = assignments.map(a => {
      let badgeClass = "badge text-bg-primary";
      if (a.status === "Completed") badgeClass = "badge text-bg-success";
      else if (a.status === "Stopped") badgeClass = "badge text-bg-danger";
      else if (a.status === "In Progress") badgeClass = "badge text-bg-warning";

      const targetText = `${a.target_value ?? 10} ${a.target_type === 'duration' ? 'sec' : 'reps'}`;
      const dateRange = `${a.start_date || '-'} → ${a.end_date || '-'}`;

      return `
        <tr>
          <td><strong>${escapeHtml(a.patient_name || 'Patient #' + a.patient_id)}</strong></td>
          <td>${escapeHtml(a.therapist_name || 'Therapist #' + a.therapist_id)}</td>
          <td>${escapeHtml(a.exercise_name || '-')}</td>
          <td>${targetText}</td>
          <td>${escapeHtml(a.frequency || '-')}</td>
          <td><small class="text-secondary">${dateRange}</small></td>
          <td><span class="badge text-bg-light border">${escapeHtml(a.difficulty || 'Medium')}</span></td>
          <td><span class="${badgeClass}">${escapeHtml(a.status || 'Assigned')}</span></td>
          <td class="sticky-action">
            <button type="button" class="btn-delete-outline" onclick="deleteAssignment(${a.assignment_id})" title="Delete Assignment">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to load assignments:", err);
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">Failed to load assignments.</td></tr>`;
  }
}

async function deleteAssignment(assignmentId) {
  if (!confirm("Are you sure you want to delete this exercise assignment?")) return;

  try {
    const res = await apiRequest(`/api/exercise-assignments/${assignmentId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("assignAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Assignment deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadAssignments();
  } catch (err) {
    alert(err.message || "Failed to delete assignment.");
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
