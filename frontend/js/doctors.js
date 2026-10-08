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

  // Load Doctors Table
  await loadDoctors();

  // Modal instance
  const modalEl = document.getElementById("doctorOtpModal");
  const otpModal = modalEl ? new bootstrap.Modal(modalEl) : null;
  let pendingDoctorToken = null;
  let pendingDoctorData = null;

  // Handle Send OTP Form
  const addForm = document.getElementById("addDoctorForm");
  const alertEl = document.getElementById("doctorAlert");
  const sendBtn = document.getElementById("btnSendDoctorOtp");

  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("docName").value.trim();
      const gender = document.getElementById("docGender").value;
      const specialization = document.getElementById("docSpecialization").value;
      const contact = document.getElementById("docContact").value.trim();
      const email = document.getElementById("docEmail").value.trim();

      if (!name || !gender || !specialization || !contact || !email) {
        showPageAlert("Please fill in all doctor details including gender.", "danger");
        return;
      }

      if (contact.length !== 10 || !/^\d+$/.test(contact)) {
        showPageAlert("Contact number must contain exactly 10 digits.", "danger");
        return;
      }

      pendingDoctorData = { name, gender, specialization, contact, email, user_id: user.user_id };

      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span>⏳</span> Sending OTP...`;

      try {
        const res = await apiRequest("/api/doctors/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingDoctorData)
        });

        pendingDoctorToken = res.doctor_token;

        // Populate Modal
        document.getElementById("modalTargetEmail").textContent = email;
        const noticeEl = document.getElementById("modalNoticeAlert");
        const errorEl = document.getElementById("modalErrorAlert");
        const inputEl = document.getElementById("doctorOtpInput");

        if (errorEl) errorEl.hidden = true;
        if (inputEl) inputEl.value = "";

        if (res.demo_otp && noticeEl) {
          noticeEl.hidden = false;
          noticeEl.innerHTML = `<strong>Note:</strong> SMTP delivery restricted. Your OTP is: <strong>${res.demo_otp}</strong>`;
        } else if (noticeEl) {
          noticeEl.hidden = true;
        }

        if (otpModal) otpModal.show();
      } catch (err) {
        showPageAlert(err.message || "Failed to send doctor OTP.", "danger");
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<span>📧</span> Send OTP &amp; Add Doctor`;
      }
    });
  }

  // Handle Verify OTP Button in Modal
  const verifyBtn = document.getElementById("btnVerifyDoctorOtp");
  if (verifyBtn) {
    verifyBtn.addEventListener("click", async () => {
      const otpInput = document.getElementById("doctorOtpInput");
      const errorEl = document.getElementById("modalErrorAlert");
      const otpVal = otpInput.value.trim();

      if (!otpVal || otpVal.length < 4) {
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.textContent = "Please enter the valid OTP code.";
        }
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.textContent = "Verifying...";

      try {
        const res = await apiRequest("/api/doctors/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor_token: pendingDoctorToken,
            otp: otpVal
          })
        });

        if (otpModal) otpModal.hide();
        showPageAlert(res.message || "Doctor verified and added successfully!", "success");

        // Clear form
        document.getElementById("docName").value = "";
        document.getElementById("docGender").value = "";
        document.getElementById("docSpecialization").value = "";
        document.getElementById("docContact").value = "";
        document.getElementById("docEmail").value = "";
        pendingDoctorToken = null;
        pendingDoctorData = null;

        await loadDoctors();
      } catch (err) {
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.textContent = err.message || "OTP verification failed. Please try again.";
        }
      } finally {
        verifyBtn.disabled = false;
        verifyBtn.textContent = "✓ Verify & Add Doctor";
      }
    });
  }

  // Handle Resend OTP Button in Modal
  const resendBtn = document.getElementById("btnResendDoctorOtp");
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      if (!pendingDoctorData) return;
      resendBtn.disabled = true;
      resendBtn.textContent = "Resending...";

      try {
        const res = await apiRequest("/api/doctors/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingDoctorData)
        });

        pendingDoctorToken = res.doctor_token;
        const noticeEl = document.getElementById("modalNoticeAlert");
        const errorEl = document.getElementById("modalErrorAlert");
        if (errorEl) errorEl.hidden = true;

        if (res.demo_otp && noticeEl) {
          noticeEl.hidden = false;
          noticeEl.innerHTML = `<strong>Note:</strong> New OTP is: <strong>${res.demo_otp}</strong>`;
        }
      } catch (err) {
        const errorEl = document.getElementById("modalErrorAlert");
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.textContent = err.message || "Could not resend OTP.";
        }
      } finally {
        resendBtn.disabled = false;
        resendBtn.textContent = "🔄 Resend OTP";
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

async function loadDoctors() {
  const tbody = document.getElementById("doctorsTableBody");
  if (!tbody) return;

  try {
    const rawUser = localStorage.getItem("currentUser");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const res = await apiRequest(`/api/doctors?user_id=${encodeURIComponent(user.user_id || '')}&role=${encodeURIComponent(user.role || '')}`);

    const doctors = (res && res.doctors) ? res.doctors : [];

    if (doctors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No doctor records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = doctors.map(d => `
      <tr>
        <td><strong>${escapeHtml(d.name || '-')}</strong></td>
        <td><span class="badge bg-light text-dark border">${escapeHtml(d.gender || '-')}</span></td>
        <td>${escapeHtml(d.specialization || '-')}</td>
        <td>${escapeHtml(d.contact || '-')}</td>
        <td>${escapeHtml(d.email || '-')}</td>
        <td>
          ${d.otp_verified
            ? '<span class="verified-pill">✓ Verified</span>'
            : '<span class="not-verified-pill">Not Verified</span>'}
        </td>
        <td class="sticky-action">
          <button type="button" class="btn-delete-outline" onclick="deleteDoctor(${d.doctor_id})" title="Delete Doctor">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load doctors:", err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Failed to load doctor records.</td></tr>`;
  }
}

async function deleteDoctor(doctorId) {
  if (!confirm("Are you sure you want to delete this doctor?")) return;

  try {
    const res = await apiRequest(`/api/doctors/${doctorId}`, {
      method: "DELETE"
    });

    const alertEl = document.getElementById("doctorAlert");
    if (alertEl) {
      alertEl.hidden = false;
      alertEl.className = "alert alert-info mb-3";
      alertEl.textContent = res.message || "Doctor deleted successfully.";
      setTimeout(() => { alertEl.hidden = true; }, 4000);
    }

    await loadDoctors();
  } catch (err) {
    alert(err.message || "Failed to delete doctor.");
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
