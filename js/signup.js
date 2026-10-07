function showSignupMessage(message, type = "danger") {
  const el = document.getElementById("signupMessage");
  el.hidden = false;
  el.className = `alert alert-${type}`;
  el.textContent = message;
}

document.getElementById("signupForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const password = data.get("password");
  const confirm = data.get("confirm_password");
  const phone = data.get("phone").trim();

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

  try {
    const result = await apiRequest("/api/signup", {
      method: "POST",
      body: data
    });
    showSignupMessage(result.message || "Account created successfully.", "success");
    setTimeout(() => window.location.href = "./index.html", 1000);
  } catch (error) {
    showSignupMessage(error.message);
  }
});
