document.addEventListener("DOMContentLoaded", async () => {
  // Check auth state
  const rawUser = localStorage.getItem("currentUser");
  let user = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch (e) {
      user = null;
    }
  }

  if (!user) {
    // If not authenticated, redirect to login
    window.location.href = "./index.html";
    return;
  }

  // Populate user info in UI
  const displayName = user.username || user.name || "User";
  const greetingEl = document.getElementById("greetingText");
  if (greetingEl) greetingEl.textContent = `Welcome, ${displayName}! 👋`;

  if (typeof renderNavbarUser === "function") {
    renderNavbarUser(user);
  }

  // Handle Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await apiRequest("/api/logout", { method: "POST" });
      } catch (err) {
        // Continue even if backend logout fails
      }
      localStorage.removeItem("currentUser");
      window.location.href = "./index.html";
    });
  }

  // Load Dashboard Data
  try {
    const data = await apiRequest(`/api/dashboard?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);
    if (data && data.stats) {
      const stats = data.stats;
      document.getElementById("statPatients").textContent = stats.patients ?? 0;
      document.getElementById("statDoctors").textContent = stats.doctors ?? 0;
      document.getElementById("statTherapists").textContent = stats.therapists ?? 0;
      document.getElementById("statAppointments").textContent = stats.appointments ?? 0;
      document.getElementById("statSessions").textContent = stats.sessions ?? 0;
      document.getElementById("statAssignments").textContent = stats.assignments ?? 0;
      document.getElementById("statReports").textContent = stats.reports ?? 0;
    }

    const tbody = document.getElementById("recentAppointmentsBody");
    if (tbody) {
      if (data.recent && data.recent.length > 0) {
        tbody.innerHTML = data.recent.map(app => {
          const statusClass = (app.status || "").toLowerCase().includes("complete")
            ? "completed"
            : (app.status || "").toLowerCase().includes("cancel")
            ? "cancelled"
            : "scheduled";

          return `
            <tr>
              <td><strong>${escapeHtml(app.appointment_date || '-')}</strong></td>
              <td>${escapeHtml(app.appointment_time || '-')}</td>
              <td>${escapeHtml(app.patient_name || '-')}</td>
              <td>${escapeHtml(app.doctor_name || '-')}</td>
              <td><span class="status-badge ${statusClass}">${escapeHtml(app.status || 'Scheduled')}</span></td>
            </tr>
          `;
        }).join("");
      } else {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No recent appointments recorded yet.</td></tr>`;
      }
    }
  } catch (error) {
    console.warn("Could not load dashboard stats from API, using fallback defaults:", error);
    // Graceful fallback display
    document.getElementById("statPatients").textContent = "0";
    document.getElementById("statDoctors").textContent = "0";
    document.getElementById("statTherapists").textContent = "0";
    document.getElementById("statAppointments").textContent = "0";
    document.getElementById("statSessions").textContent = "0";
    document.getElementById("statAssignments").textContent = "0";
    document.getElementById("statReports").textContent = "0";
    const tbody = document.getElementById("recentAppointmentsBody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No appointments found.</td></tr>`;
    }
  }
});

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
