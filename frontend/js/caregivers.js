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

  // Load Patient Dropdown
  await loadPatientDropdown(user);

  // Load Caregivers Table
  await loadCaregivers();

  // Handle Form Submit
  const addForm = document.getElementById("addCaregiverForm");
  const alertEl = document.getElementById("caregiverAlert");
  const addBtn = document.getElementById("btnAddCaregiver");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const patient_id = document.getElementById("cPatient").value;
      const caregiver_name = document.getElementById("cName").value.trim();
      const relationship = document.getElementById("cRelationship").value.trim();
      const contact = document.getElementById("cContact").value.trim();
      const emergency_contact = document.getElementById("cEmergencyContact").value.trim();

      if (!patient_id || !caregiver_name || !relationship || !contact || !emergency_contact) {
        showPageAlert("Please fill in all caregiver details.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      try {
        const res = await apiRequest("/api/caregivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id,
            caregiver_name,
            relationship,
            contact,
            emergency_contact,
            user_id: user.user_id
          })
        });

        showPageAlert(res.message || "Caregiver added successfully!", "success");

        document.getElementById("cPatient").value = "";
        document.getElementById("cName").value = "";
        document.getElementById("cRelationship").value = "";
        document.getElementById("cContact").value = "";
        document.getElementById("cEmergencyContact").value = "";

        await loadCaregivers();
      } catch (err) {
        showPageAlert(err.message || "Failed to add caregiver.", "danger");
      } finally {
        addBtn.disabled = false;
        addBtn.textContent = "+ Add";
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

async function loadPatientDropdown(user) {
  try {
    const res = await apiRequest(`/api/patients?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);
    const select = document.getElementById("cPatient");
    if (select && res.patients) {
      select.innerHTML = `<option value="" disabled selected>Patient</option>` +
        res.patients.map(p => `<option value="${p.patient_id}">${escapeHtml(p.name)}</option>`).join("");
    }
  } catch (err) {
    console.error("Failed to load patients for caregiver form:", err);
  }
}

async function loadCaregivers() {
  const tbody = document.getElementById("caregiversTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/caregivers?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const caregivers = (res && res.caregivers) ? res.caregivers : [];

    if (caregivers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No caregivers found.</td></tr>`;
      return;
    }

    tbody.innerHTML = caregivers.map(c => `
      <tr>
        <td><strong>#${c.patient_id} ${escapeHtml(c.patient_name ? '(' + c.patient_name + ')' : '')}</strong></td>
        <td>${escapeHtml(c.caregiver_name || '-')}</td>
        <td>${escapeHtml(c.relationship || '-')}</td>
        <td>${escapeHtml(c.contact || '-')}</td>
        <td>${escapeHtml(c.emergency_contact || '-')}</td>
        <td class="sticky-action">
          <button type="button" class="btn-delete-outline" onclick="deleteCaregiver(${c.caregiver_id})" title="Delete Caregiver">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load caregivers:", err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load caregivers.</td></tr>`;
  }
}

async function deleteCaregiver(caregiverId) {
  if (!confirm("Are you sure you want to delete this caregiver record?")) return;

  try {
    const res = await apiRequest(`/api/caregivers/${caregiverId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("caregiverAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Caregiver deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadCaregivers();
  } catch (err) {
    alert(err.message || "Failed to delete caregiver.");
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
