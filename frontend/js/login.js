function showMessage(id, message, type = "danger") {
  const el = document.getElementById(id);
  el.hidden = false;
  el.className = `alert alert-${type}`;
  el.textContent = message;
}

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";
  for (let i = 0; i < 5; i++) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  sessionStorage.setItem("captcha", value);
  document.getElementById("captchaText").textContent = value;
  document.getElementById("captchaInput").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  // Clear any existing session so new login starts clean
  localStorage.removeItem("currentUser");
  generateCaptcha();

  document.getElementById("refreshCaptcha").addEventListener("click", generateCaptcha);

  document.getElementById("togglePassword").addEventListener("click", () => {
    const input = document.getElementById("loginPassword");
    const button = document.getElementById("togglePassword");
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    button.textContent = hidden ? "🙈" : "👁️";
  });


  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (document.getElementById("captchaInput").value.trim().toUpperCase() !==
        sessionStorage.getItem("captcha")) {
      showMessage("loginMessage", "Invalid CAPTCHA.");
      generateCaptcha();
      return;
    }

    try {
      const data = await apiRequest("/api/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: document.getElementById("username").value.trim(),
          password: document.getElementById("loginPassword").value,
          remember: document.getElementById("remember").checked
        })
      });

      showMessage("loginMessage", data.message || "Login successful.", "success");
      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }
      window.location.href = "./dashboard.html";
    } catch (error) {
      showMessage("loginMessage", error.message);
      generateCaptcha();
    }
  });
});
