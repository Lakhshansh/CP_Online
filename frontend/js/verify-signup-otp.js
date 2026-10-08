document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email") || sessionStorage.getItem("signup_pending_email") || "";
  const demoOtp = sessionStorage.getItem("signup_demo_otp");
  const flashMessage = sessionStorage.getItem("signup_flash_message") || "OTP sent to your email.";

  // Update target email display
  const userEmailText = document.getElementById("userEmailText");
  if (userEmailText) {
    userEmailText.textContent = email || "your registered email";
  }

  // Show top flash notification
  const topFlashBanner = document.getElementById("topFlashBanner");
  if (topFlashBanner) {
    topFlashBanner.textContent = flashMessage;
    topFlashBanner.hidden = false;
  }

  // Show demo OTP banner if outbound email was blocked by cloud host
  const demoOtpBanner = document.getElementById("demoOtpBanner");
  if (demoOtpBanner && demoOtp) {
    demoOtpBanner.textContent = `💡 Note: Test verification OTP is: ${demoOtp}`;
    demoOtpBanner.hidden = false;
  }

  // OTP input restriction (numeric only)
  const otpInput = document.getElementById("emailOtpInput");
  if (otpInput) {
    otpInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  }

  function showAlert(msg, type = "danger") {
    const alertEl = document.getElementById("otpAlert");
    if (!alertEl) return;
    alertEl.hidden = false;
    alertEl.className = `alert alert-${type} mb-3`;
    alertEl.textContent = msg;
  }

  // Handle Verify Submission
  const verifyForm = document.getElementById("verifyOtpForm");
  if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const otp = otpInput ? otpInput.value.trim() : "";
      if (!/^[0-9]{6}$/.test(otp)) {
        showAlert("Please enter a valid 6-digit OTP code.");
        return;
      }

      const btnVerify = document.getElementById("btnVerify");
      if (btnVerify) {
        btnVerify.disabled = true;
        btnVerify.textContent = "Verifying...";
      }

      try {
        const response = await apiRequest("/api/verify-signup-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_otp: otp,
            email: email
          })
        });

        showAlert(response.message || "Account verified & created successfully! Redirecting to login...", "success");

        // Clear temporary signup storage
        sessionStorage.removeItem("signup_pending_email");
        sessionStorage.removeItem("signup_demo_otp");
        sessionStorage.removeItem("signup_flash_message");

        setTimeout(() => {
          window.location.href = "./index.html";
        }, 1800);
      } catch (err) {
        showAlert(err.message || "Failed to verify OTP. Please try again.");
        if (btnVerify) {
          btnVerify.disabled = false;
          btnVerify.textContent = "✅ Verify & Create Account";
        }
      }
    });
  }

  // Handle Resend OTP
  const btnResend = document.getElementById("btnResend");
  if (btnResend) {
    btnResend.addEventListener("click", async () => {
      btnResend.disabled = true;
      btnResend.textContent = "Sending new OTP...";

      try {
        const response = await apiRequest("/api/resend-signup-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email })
        });

        showAlert(response.message || "New OTP sent to your email.", "success");

        if (response.demo_otp && demoOtpBanner) {
          demoOtpBanner.textContent = `💡 Note: New test OTP is: ${response.demo_otp}`;
          demoOtpBanner.hidden = false;
        }

        if (otpInput) {
          otpInput.value = "";
          otpInput.focus();
        }
      } catch (err) {
        showAlert(err.message || "Failed to resend OTP.");
      } finally {
        btnResend.disabled = false;
        btnResend.textContent = "🔄 Resend OTP";
      }
    });
  }
});
