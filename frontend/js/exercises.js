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

  // Load Exercises Table
  await loadExercises();

  // Handle Add Form
  const addForm = document.getElementById("addExerciseForm");
  const alertEl = document.getElementById("exerciseAlert");
  const addBtn = document.getElementById("btnAddExercise");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const exercise_name = document.getElementById("exName").value.trim();
      const description = document.getElementById("exDesc").value.trim();
      const therapy_type = document.getElementById("exType").value.trim();

      if (!exercise_name || !description || !therapy_type) {
        showPageAlert("Please fill in all exercise details.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      try {
        const res = await apiRequest("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercise_name, description, therapy_type })
        });

        showPageAlert(res.message || "Exercise added successfully!", "success");

        document.getElementById("exName").value = "";
        document.getElementById("exDesc").value = "";
        document.getElementById("exType").value = "";

        await loadExercises();
      } catch (err) {
        showPageAlert(err.message || "Failed to add exercise.", "danger");
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

async function loadExercises() {
  const tbody = document.getElementById("exercisesTableBody");
  if (!tbody) return;

  try {
    const res = await apiRequest("/api/exercises");
    const exercises = (res && res.exercises) ? res.exercises : [];

    if (exercises.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No exercises found.</td></tr>`;
      return;
    }

    tbody.innerHTML = exercises.map(e => `
      <tr>
        <td><strong>${escapeHtml(e.exercise_name || '-')}</strong></td>
        <td>${escapeHtml(e.description || '-')}</td>
        <td><span class="badge bg-light text-dark border">${escapeHtml(e.therapy_type || '-')}</span></td>
        <td class="sticky-action">
          <button type="button" class="btn-delete-outline" onclick="deleteExercise(${e.exercise_id})" title="Delete Exercise">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load exercises:", err);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Failed to load exercises.</td></tr>`;
  }
}

async function deleteExercise(exerciseId) {
  if (!confirm("Are you sure you want to delete this exercise?")) return;

  try {
    const res = await apiRequest(`/api/exercises/${exerciseId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("exerciseAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Exercise deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadExercises();
  } catch (err) {
    alert(err.message || "Failed to delete exercise.");
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
