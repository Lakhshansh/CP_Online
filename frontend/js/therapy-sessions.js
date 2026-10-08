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
  const displayName = user.username || "User";
  const displayRole = user.role || "Admin";
  const navUserEl = document.getElementById("navUsername");
  const navRoleEl = document.getElementById("navRole");
  const navAvatarEl = document.getElementById("navAvatar");

  if (navUserEl) navUserEl.textContent = displayName;
  if (navRoleEl) navRoleEl.textContent = displayRole;
  if (navAvatarEl) navAvatarEl.textContent = (displayName.charAt(0) || "👤").toUpperCase();

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try { await apiRequest("/api/logout", { method: "POST" }); } catch (e) {}
      localStorage.removeItem("currentUser");
      window.location.href = "./index.html";
    });
  }

  // Default date
  const sDateInput = document.getElementById("sDate");
  if (sDateInput) {
    sDateInput.value = new Date().toISOString().split("T")[0];
  }

  // Populate dropdowns
  await loadDropdownData(user);

  // Load Sessions
  await loadSessions();

  // Handle Add Form
  const addForm = document.getElementById("addSessionForm");
  const alertEl = document.getElementById("sessionAlert");
  const addBtn = document.getElementById("btnAddSession");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const patient_id = document.getElementById("sPatient").value;
      const therapist_id = document.getElementById("sTherapist").value;
      const exercise_id = document.getElementById("sExercise").value;
      const session_date = document.getElementById("sDate").value;
      const duration_minutes = parseInt(document.getElementById("sDuration").value, 10);
      const notes = document.getElementById("sNotes").value.trim();

      if (!patient_id || !therapist_id || !exercise_id || !session_date || !duration_minutes) {
        showPageAlert("Please fill in all session details.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      try {
        const res = await apiRequest("/api/therapy-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id,
            therapist_id,
            exercise_id,
            session_date,
            duration_minutes,
            notes,
            user_id: user.user_id
          })
        });

        showPageAlert(res.message || "Therapy session added successfully!", "success");

        // Reset
        document.getElementById("sPatient").value = "";
        document.getElementById("sTherapist").value = "";
        document.getElementById("sExercise").value = "";
        document.getElementById("sDuration").value = "";
        document.getElementById("sNotes").value = "";

        await loadSessions();
      } catch (err) {
        showPageAlert(err.message || "Failed to add therapy session.", "danger");
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = "+ Add Session";
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

    const pSelect = document.getElementById("sPatient");
    if (pSelect && pRes.patients) {
      pSelect.innerHTML = `<option value="" disabled selected>Select Patient</option>` +
        pRes.patients.map(p => `<option value="${p.patient_id}">${escapeHtml(p.name)}</option>`).join("");
    }

    const tSelect = document.getElementById("sTherapist");
    if (tSelect && tRes.therapists) {
      tSelect.innerHTML = `<option value="" disabled selected>Select Therapist</option>` +
        tRes.therapists.map(t => `<option value="${t.therapist_id}">${escapeHtml(t.name)}</option>`).join("");
    }

    const eSelect = document.getElementById("sExercise");
    if (eSelect && eRes.exercises) {
      eSelect.innerHTML = `<option value="" disabled selected>Select Exercise</option>` +
        eRes.exercises.map(e => `<option value="${e.exercise_id}">${escapeHtml(e.exercise_name)}</option>`).join("");
    }
  } catch (err) {
    console.error("Failed to populate dropdowns:", err);
  }
}

async function loadSessions() {
  const tbody = document.getElementById("sessionsTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/therapy-sessions?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const sessions = (res && res.sessions) ? res.sessions : [];

    if (sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No therapy sessions found.</td></tr>`;
      return;
    }

    tbody.innerHTML = sessions.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.session_date || '-')}</strong></td>
        <td>${escapeHtml(s.patient_name || 'Patient #' + s.patient_id)}</td>
        <td>${escapeHtml(s.therapist_name || 'Therapist #' + s.therapist_id)}</td>
        <td>${escapeHtml(s.exercise_name || '-')}</td>
        <td>${s.duration_minutes ?? '-'} min</td>
        <td>${escapeHtml(s.notes || '-')}</td>
        <td class="sticky-action">
          <button type="button" class="btn-delete-outline" onclick="deleteSession(${s.session_id})" title="Delete Session">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load sessions:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Failed to load sessions.</td></tr>`;
  }
}

async function deleteSession(sessionId) {
  if (!confirm("Are you sure you want to delete this therapy session?")) return;

  try {
    const res = await apiRequest(`/api/therapy-sessions/${sessionId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("sessionAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Therapy session deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadSessions();
  } catch (err) {
    alert(err.message || "Failed to delete session.");
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
