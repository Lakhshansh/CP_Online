function showSignupMessage(message, type = "danger") {
  const el = document.getElementById("signupMessage");
  if (!el) return;
  el.hidden = false;
  el.className = `alert alert-${type} mb-3`;
  el.textContent = message;
}

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";
  for (let i = 0; i < 5; i++) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  sessionStorage.setItem("signup_captcha", value);
  const captchaText = document.getElementById("captchaText");
  if (captchaText) captchaText.textContent = value;
  const captchaInput = document.getElementById("captchaInput");
  if (captchaInput) captchaInput.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  generateCaptcha();

  const refreshBtn = document.getElementById("refreshCaptcha");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", generateCaptcha);
  }

  // Toggle Password Visibility
  const togglePass = document.getElementById("toggleSignupPassword");
  if (togglePass) {
    togglePass.addEventListener("click", () => {
      const input = document.getElementById("signupPassword");
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      togglePass.textContent = isHidden ? "🙈" : "👁️";
    });
  }

  // Toggle Confirm Password Visibility
  const toggleConfirm = document.getElementById("toggleSignupConfirm");
  if (toggleConfirm) {
    toggleConfirm.addEventListener("click", () => {
      const input = document.getElementById("signupConfirm");
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      toggleConfirm.textContent = isHidden ? "🙈" : "👁️";
    });
  }

  // Form submission
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Security CAPTCHA Check
      const captchaInput = document.getElementById("captchaInput");
      const enteredCaptcha = (captchaInput ? captchaInput.value : "").trim().toUpperCase();
      const expectedCaptcha = sessionStorage.getItem("signup_captcha");

      if (enteredCaptcha !== expectedCaptcha) {
        showSignupMessage("Invalid Security Verification code.");
        generateCaptcha();
        return;
      }

      const form = event.currentTarget;
      const data = new FormData(form);
      const password = (data.get("password") || "").toString();
      const confirm = (data.get("confirm_password") || "").toString();
      const phone = (data.get("phone") || "").toString().trim();

      if (!/^[0-9]{10}$/.test(phone)) {
        showSignupMessage("Please enter a valid 10-digit mobile number.");
        return;
      }

      if (password !== confirm) {
        showSignupMessage("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        showSignupMessage("Password must be at least 6 characters.");
        return;
      }

      const docInput = document.getElementById("document_file");
      const docFile = docInput && docInput.files ? docInput.files[0] : null;
      if (!docFile) {
        showSignupMessage("Doctor verification document upload is mandatory.");
        return;
      }

      if (docFile.size > 5 * 1024 * 1024) {
        showSignupMessage("Uploaded document file size must be 5 MB or less.");
        return;
      }

      const submitBtn = document.getElementById("signupSubmitBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
      }

      try {
        const result = await apiRequest("/api/signup", {
          method: "POST",
          body: data
        });

        if (result && result.requires_otp) {
          const emailVal = result.email || data.get("email");
          sessionStorage.setItem("signup_pending_email", emailVal);
          if (result.demo_otp) {
            sessionStorage.setItem("signup_demo_otp", result.demo_otp);
          }
          if (result.message) {
            sessionStorage.setItem("signup_flash_message", result.message);
          }
          window.location.href = `./verify-signup-otp.html?email=${encodeURIComponent(emailVal)}`;
          return;
        }

        showSignupMessage(result.message || "Account created successfully! Redirecting to login...", "success");

        setTimeout(() => {
          window.location.href = "./index.html";
        }, 1800);
      } catch (error) {
        showSignupMessage(error.message || "Failed to create account. Please try again.");
        generateCaptcha();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Account";
        }
      }
    });
  }
});
