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

  // Set default date to today
  const apptDateInput = document.getElementById("apptDate");
  if (apptDateInput) {
    apptDateInput.value = new Date().toISOString().split("T")[0];
  }

  // Populate Patients & Doctors dropdowns
  await loadDropdownData(user);

  // Load Appointments Table
  await loadAppointments();

  // Handle Add Form
  const addForm = document.getElementById("addApptForm");
  const alertEl = document.getElementById("apptAlert");
  const addBtn = document.getElementById("btnAddAppt");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const patient_id = document.getElementById("apptPatient").value;
      const doctor_id = document.getElementById("apptDoctor").value;
      const appointment_date = document.getElementById("apptDate").value;
      const appointment_time = document.getElementById("apptTime").value;
      const status = document.getElementById("apptStatus").value;

      if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
        showPageAlert("Please select patient, doctor, date and time.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      try {
        const res = await apiRequest("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            status,
            user_id: user.user_id
          })
        });

        showPageAlert(res.message || "Appointment added successfully!", "success");

        // Reset inputs
        document.getElementById("apptPatient").value = "";
        document.getElementById("apptDoctor").value = "";
        document.getElementById("apptTime").value = "";
        document.getElementById("apptStatus").value = "Scheduled";

        await loadAppointments();
      } catch (err) {
        showPageAlert(err.message || "Failed to add appointment.", "danger");
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = "+ Add Appointment";
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
    const [pRes, dRes] = await Promise.all([
      apiRequest(`/api/patients?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`).catch(() => ({ patients: [] })),
      apiRequest(`/api/doctors?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`).catch(() => ({ doctors: [] }))
    ]);

    const pSelect = document.getElementById("apptPatient");
    if (pSelect && pRes.patients) {
      pSelect.innerHTML = `<option value="" disabled selected>Select Patient</option>` +
        pRes.patients.map(p => `<option value="${p.patient_id}">${escapeHtml(p.name)}</option>`).join("");
    }

    const dSelect = document.getElementById("apptDoctor");
    if (dSelect && dRes.doctors) {
      dSelect.innerHTML = `<option value="" disabled selected>Select Doctor</option>` +
        dRes.doctors.map(d => `<option value="${d.doctor_id}">${escapeHtml(d.name)}</option>`).join("");
    }
  } catch (err) {
    console.error("Failed to populate dropdowns:", err);
  }
}

async function loadAppointments() {
  const tbody = document.getElementById("apptsTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/appointments?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const appts = (res && res.appointments) ? res.appointments : [];

    if (appts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No appointments found.</td></tr>`;
      return;
    }

    tbody.innerHTML = appts.map(a => {
      let badgeClass = "badge bg-primary";
      if (a.status === "Completed") badgeClass = "badge bg-success";
      else if (a.status === "Cancelled") badgeClass = "badge bg-danger";
      else if (a.status === "Rescheduled") badgeClass = "badge bg-warning text-dark";

      return `
        <tr>
          <td><strong>${escapeHtml(a.appointment_date || '-')}</strong></td>
          <td>${escapeHtml(a.appointment_time || '-')}</td>
          <td>${escapeHtml(a.patient_name || 'Patient #' + a.patient_id)}</td>
          <td>${escapeHtml(a.doctor_name || 'Doctor #' + a.doctor_id)}</td>
          <td><span class="${badgeClass}">${escapeHtml(a.status || 'Scheduled')}</span></td>
          <td class="sticky-action">
            <button type="button" class="btn-delete-outline" onclick="deleteAppointment(${a.appointment_id})" title="Delete Appointment">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join("");
  } catch (err) {
    console.error("Failed to load appointments:", err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load appointments.</td></tr>`;
  }
}

async function deleteAppointment(apptId) {
  if (!confirm("Are you sure you want to delete this appointment?")) return;

  try {
    const res = await apiRequest(`/api/appointments/${apptId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("apptAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Appointment deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadAppointments();
  } catch (err) {
    alert(err.message || "Failed to delete appointment.");
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
