document.addEventListener("DOMContentLoaded", async () => {
  // Check auth
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

  // Pre-fill today's date in registration date input
  const regDateInput = document.getElementById("pRegDate");
  if (regDateInput) {
    const today = new Date().toISOString().split("T")[0];
    regDateInput.value = today;
  }

  // Load Patients
  await loadPatients();

  // Handle Add Patient Form
  const addForm = document.getElementById("addPatientForm");
  const alertEl = document.getElementById("patientAlert");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("btnAddPatient");
      btn.disabled = true;
      btn.textContent = "Adding...";

      const payload = {
        name: document.getElementById("pName").value.trim(),
        age: parseInt(document.getElementById("pAge").value, 10),
        gender: document.getElementById("pGender").value,
        contact: document.getElementById("pContact").value.trim(),
        address: document.getElementById("pAddress").value.trim(),
        disability_details: document.getElementById("pDisability").value.trim(),
        registration_date: document.getElementById("pRegDate").value,
        email: document.getElementById("pEmail").value.trim(),
        user_id: user.user_id
      };

      try {
        const res = await apiRequest("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (alertEl) {
          alertEl.hidden = false;
          alertEl.className = "alert alert-success mb-3";
          alertEl.textContent = res.message || "Patient added successfully!";
          setTimeout(() => { alertEl.hidden = true; }, 4000);
        }

        // Reset form inputs (preserve date)
        document.getElementById("pName").value = "";
        document.getElementById("pAge").value = "";
        document.getElementById("pGender").value = "";
        document.getElementById("pContact").value = "";
        document.getElementById("pAddress").value = "";
        document.getElementById("pDisability").value = "";
        document.getElementById("pEmail").value = "";

        await loadPatients();
      } catch (err) {
        if (alertEl) {
          alertEl.hidden = false;
          alertEl.className = "alert alert-danger mb-3";
          alertEl.textContent = err.message || "Failed to add patient.";
        }
      } finally {
        btn.disabled = false;
        btn.textContent = "+ Add";
      }
    });
  }
});

async function loadPatients() {
  const tbody = document.getElementById("patientsTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/patients?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const patients = (res && res.patients) ? res.patients : [];

    if (patients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No patient records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = patients.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.name || '-')}</strong></td>
        <td>${p.age ?? '-'}</td>
        <td>${escapeHtml(p.gender || '-')}</td>
        <td>${escapeHtml(p.contact || '-')}</td>
        <td>${escapeHtml(p.address || '-')}</td>
        <td>${escapeHtml(p.disability_details || '-')}</td>
        <td>${escapeHtml(p.registration_date || '-')}</td>
        <td>${escapeHtml(p.email || '-')}</td>
        <td>
          ${p.otp_verified
            ? '<span class="verified-pill">✓ Verified</span>'
            : '<span class="not-verified-pill">Pending</span>'}
        </td>
        <td class="sticky-action">
          <button type="button" class="btn-delete-patient" onclick="deletePatient(${p.patient_id})" title="Delete Patient Record">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load patients:", err);
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">Failed to load patient records.</td></tr>`;
  }
}

async function deletePatient(patientId) {
  if (!confirm("Are you sure you want to delete this patient record?")) return;

  try {
    const res = await apiRequest(`/api/patients/${patientId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("patientAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Patient deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadPatients();
  } catch (err) {
    alert(err.message || "Failed to delete patient.");
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
