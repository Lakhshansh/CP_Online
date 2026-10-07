function showForgotMessage(message, type = "danger") {
  const el = document.getElementById("forgotMessage");
  el.hidden = false;
  el.className = `alert alert-${type} mb-3`;
  el.textContent = message;
}

function clearForgotMessage() {
  const el = document.getElementById("forgotMessage");
  el.hidden = true;
  el.textContent = "";
}

let savedIdentifier = "";
let savedResetToken = "";
let savedVerifiedToken = "";

document.addEventListener("DOMContentLoaded", () => {
  const step1Form = document.getElementById("step1Form");
  const step2Form = document.getElementById("step2Form");
  const step3Form = document.getElementById("step3Form");
  const demoOtpBox = document.getElementById("demoOtpBox");

  // STEP 1: Request OTP
  step1Form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearForgotMessage();

    const identifier = document.getElementById("identifier").value.trim();
    if (!identifier) {
      showForgotMessage("Please enter your username or email.");
      return;
    }

    const btn = document.getElementById("btnSendOtp");
    btn.disabled = true;
    btn.textContent = "Sending Code...";

    try {
      const res = await apiRequest("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });

      savedIdentifier = identifier;
      savedResetToken = res.reset_token || "";
      showForgotMessage(res.message || "Recovery code sent!", "info");

      if (res.demo_otp) {
        demoOtpBox.hidden = false;
        demoOtpBox.textContent = `Cloud Notice: Your verification code is: ${res.demo_otp}`;
        // Automatically prefill the OTP input for convenience
        const otpInput = document.getElementById("otpInput");
        if (otpInput) otpInput.value = res.demo_otp;
      } else {
        demoOtpBox.hidden = true;
      }

      step1Form.hidden = true;
      step2Form.hidden = false;
      document.getElementById("otpInput").focus();
    } catch (err) {
      showForgotMessage(err.message || "Failed to send recovery code.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Send Recovery Code";
    }
  });

  // STEP 2: Verify OTP
  step2Form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearForgotMessage();

    const otp = document.getElementById("otpInput").value.trim();
    if (!/^[0-9]{6}$/.test(otp)) {
      showForgotMessage("Please enter a valid 6-digit code.");
      return;
    }

    const btn = document.getElementById("btnVerifyOtp");
    btn.disabled = true;
    btn.textContent = "Verifying...";

    try {
      const res = await apiRequest("/api/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          identifier: savedIdentifier,
          reset_token: savedResetToken
        })
      });

      savedVerifiedToken = res.verified_token || "";
      showForgotMessage(res.message || "Code verified!", "success");
      demoOtpBox.hidden = true;
      step2Form.hidden = true;
      step3Form.hidden = false;
      document.getElementById("newPassword").focus();
    } catch (err) {
      showForgotMessage(err.message || "Invalid or expired code.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Verify Code";
    }
  });

  // Resend OTP
  document.getElementById("btnResend").addEventListener("click", async () => {
    clearForgotMessage();
    const btn = document.getElementById("btnResend");
    btn.disabled = true;
    btn.textContent = "Resending...";

    try {
      const res = await apiRequest("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: savedIdentifier })
      });

      savedResetToken = res.reset_token || "";
      showForgotMessage("A new recovery code has been sent.", "info");
      if (res.demo_otp) {
        demoOtpBox.hidden = false;
        demoOtpBox.textContent = `Cloud Notice: Your verification code is: ${res.demo_otp}`;
        const otpInput = document.getElementById("otpInput");
        if (otpInput) otpInput.value = res.demo_otp;
      }
    } catch (err) {
      showForgotMessage(err.message || "Failed to resend code.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Resend Code";
    }
  });

  // STEP 3: Reset Password
  step3Form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearForgotMessage();

    const password = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password.length < 6) {
      showForgotMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      showForgotMessage("Passwords do not match.");
      return;
    }

    const btn = document.getElementById("btnResetPassword");
    btn.disabled = true;
    btn.textContent = "Updating...";

    try {
      const res = await apiRequest("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirm_password: confirm,
          verified_token: savedVerifiedToken
        })
      });

      showForgotMessage(res.message || "Password updated successfully!", "success");
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1500);
    } catch (err) {
      showForgotMessage(err.message || "Failed to reset password.");
      btn.disabled = false;
      btn.textContent = "Update Password";
    }
  });
});
