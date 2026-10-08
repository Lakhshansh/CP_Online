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

  // Load Therapists Table
  await loadTherapists();

  // Handle Add Therapist Form
  const addForm = document.getElementById("addTherapistForm");
  const alertEl = document.getElementById("therapistAlert");
  const addBtn = document.getElementById("btnAddTherapist");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("tName").value.trim();
      const specialization = document.getElementById("tSpecialization").value.trim();
      const contact = document.getElementById("tContact").value.trim();

      if (!name || !specialization || !contact) {
        showPageAlert("Please fill in all therapist details.", "danger");
        return;
      }

      if (contact.length !== 10 || !/^\d+$/.test(contact)) {
        showPageAlert("Contact must contain exactly 10 digits.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      try {
        const res = await apiRequest("/api/therapists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            specialization,
            contact,
            user_id: user.user_id
          })
        });

        showPageAlert(res.message || "Therapist added successfully!", "success");

        // Clear form
        document.getElementById("tName").value = "";
        document.getElementById("tSpecialization").value = "";
        document.getElementById("tContact").value = "";

        await loadTherapists();
      } catch (err) {
        showPageAlert(err.message || "Failed to add therapist.", "danger");
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
    setTimeout(() => { alertEl.hidden = true; }, 5000);
  }
});

async function loadTherapists() {
  const tbody = document.getElementById("therapistsTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/therapists?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const therapists = (res && res.therapists) ? res.therapists : [];

    if (therapists.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No therapist records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = therapists.map(t => `
      <tr>
        <td><strong>${escapeHtml(t.name || '-')}</strong></td>
        <td>${escapeHtml(t.specialization || '-')}</td>
        <td>${escapeHtml(t.contact || '-')}</td>
        <td class="sticky-action">
          <button type="button" class="btn-delete-outline" onclick="deleteTherapist(${t.therapist_id})" title="Delete Therapist">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load therapists:", err);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Failed to load therapist records.</td></tr>`;
  }
}

async function deleteTherapist(therapistId) {
  if (!confirm("Are you sure you want to delete this therapist?")) return;

  try {
    const res = await apiRequest(`/api/therapists/${therapistId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("therapistAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Therapist deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadTherapists();
  } catch (err) {
    alert(err.message || "Failed to delete therapist.");
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
