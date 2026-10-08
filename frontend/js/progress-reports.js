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

  // Set default date to today
  const rDateInput = document.getElementById("rDate");
  if (rDateInput) {
    rDateInput.value = new Date().toISOString().split("T")[0];
  }

  // Populate Patient Dropdown
  await loadPatientDropdown(user);

  // Load Reports Table
  await loadReports();

  // Handle Form Submit
  const addForm = document.getElementById("addReportForm");
  const alertEl = document.getElementById("reportAlert");
  const addBtn = document.getElementById("btnAddReport");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const patient_id = document.getElementById("rPatient").value;
      const report_date = document.getElementById("rDate").value;
      const mobility_score = parseInt(document.getElementById("rMobility").value, 10);
      const improvement_notes = document.getElementById("rNotes").value.trim();

      if (!patient_id || !report_date || isNaN(mobility_score)) {
        showPageAlert("Please fill in all progress report details.", "danger");
        return;
      }

      addBtn.disabled = true;
      addBtn.textContent = "Adding...";

      try {
        const res = await apiRequest("/api/progress-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id,
            report_date,
            mobility_score,
            improvement_notes,
            user_id: user.user_id
          })
        });

        showPageAlert(res.message || "Progress report added successfully!", "success");

        document.getElementById("rPatient").value = "";
        document.getElementById("rMobility").value = "";
        document.getElementById("rNotes").value = "";

        await loadReports();
      } catch (err) {
        showPageAlert(err.message || "Failed to add progress report.", "danger");
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
    const select = document.getElementById("rPatient");
    if (select && res.patients) {
      select.innerHTML = `<option value="" disabled selected>Patient</option>` +
        res.patients.map(p => `<option value="${p.patient_id}">${escapeHtml(p.name)}</option>`).join("");
    }
  } catch (err) {
    console.error("Failed to load patients for progress reports:", err);
  }
}

async function loadReports() {
  const tbody = document.getElementById("reportsTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/progress-reports?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const reports = (res && res.reports) ? res.reports : [];

    if (reports.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No progress reports found.</td></tr>`;
      return;
    }

    tbody.innerHTML = reports.map(r => `
      <tr>
        <td><strong>#${r.patient_id} ${escapeHtml(r.patient_name ? '(' + r.patient_name + ')' : '')}</strong></td>
        <td>${escapeHtml(r.report_date || '-')}</td>
        <td><span class="badge bg-primary fs-6">${r.mobility_score ?? '-'}</span></td>
        <td>${escapeHtml(r.improvement_notes || '-')}</td>
        <td class="sticky-action">
          <div class="d-inline-flex gap-2">
            <button type="button" class="btn-pdf-download" onclick="downloadPdfReport(${r.report_id}, '${escapeHtml(r.patient_name || 'Patient')}', '${r.report_date || ''}', ${r.mobility_score || 0}, '${escapeHtml(r.improvement_notes || '')}')" title="Download Progress Report PDF">
              📥 Download PDF
            </button>
            <button type="button" class="btn-delete-outline" onclick="deleteReport(${r.report_id})" title="Delete Report">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load progress reports:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Failed to load progress reports.</td></tr>`;
  }
}

function downloadPdfReport(reportId, patientName, reportDate, mobilityScore, notes) {
  // Generate downloadable formatted printable PDF / view
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download or print the report.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Progress Report #${reportId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0d6efd; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 800; color: #0d6efd; margin-bottom: 5px; }
        .subtitle { font-size: 15px; color: #64748b; }
        .report-box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 25px; margin-bottom: 30px; }
        .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .label { font-weight: 700; color: #475569; width: 200px; }
        .val { font-weight: 500; flex: 1; }
        .score { font-size: 20px; font-weight: 800; color: #0d6efd; }
        .footer { margin-top: 40px; text-align: center; font-size: 13px; color: #94a3b8; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">MULTI THERAPY MANAGEMENT SYSTEM</div>
        <div class="subtitle">Care • Support • Progress • Together</div>
        <h2 style="margin-top: 15px; color: #1e293b;">PATIENT PROGRESS REPORT</h2>
      </div>

      <div class="report-box">
        <div class="row"><div class="label">Report ID:</div><div class="val">#${reportId}</div></div>
        <div class="row"><div class="label">Patient Name:</div><div class="val">${patientName}</div></div>
        <div class="row"><div class="label">Report Date:</div><div class="val">${reportDate}</div></div>
        <div class="row"><div class="label">Mobility Score:</div><div class="val score">${mobilityScore} / 100</div></div>
        <div class="row" style="border-bottom: none;"><div class="label">Improvement Notes:</div><div class="val">${notes || 'N/A'}</div></div>
      </div>

      <div class="footer">
        Generated automatically by Multi Therapy Management System on ${new Date().toLocaleDateString()}.
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 24px; background: #0d6efd; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

async function deleteReport(reportId) {
  if (!confirm("Are you sure you want to delete this progress report?")) return;

  try {
    const res = await apiRequest(`/api/progress-reports/${reportId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("reportAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Progress report deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadReports();
  } catch (err) {
    alert(err.message || "Failed to delete progress report.");
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
