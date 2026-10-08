// Automatically detect local vs production environment
const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.protocol === "file:"
);

// Set this to your deployed Flask API for production
const API_BASE_URL =
  window.VITE_API_BASE_URL ||
  localStorage.getItem("API_BASE_URL") ||
  (isLocalhost ? "http://127.0.0.1:5000" : "https://cp-backend-t590.onrender.com");

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data;
}

// Global helper to populate navbar user details and profile photo across all pages
function renderNavbarUser(user) {
  if (!user) {
    const raw = localStorage.getItem("currentUser");
    if (raw) {
      try { user = JSON.parse(raw); } catch (e) { user = null; }
    }
  }
  if (!user) return;

  const displayName = user.username || user.name || "User";
  const displayRole = user.role || "Admin";

  const navUsernameEl = document.getElementById("navUsername");
  const navRoleEl = document.getElementById("navRole");
  const navAvatarEl = document.getElementById("navAvatar");
  const navAvatarImg = document.getElementById("navAvatarImg");

  if (navUsernameEl) navUsernameEl.textContent = displayName;
  if (navRoleEl) navRoleEl.textContent = displayRole;

  if (user.profile_photo) {
    const photoSrc = (user.profile_photo.startsWith("http") || user.profile_photo.startsWith("data:"))
      ? user.profile_photo
      : `${API_BASE_URL}/static/profile_photos/${user.profile_photo}`;

    if (navAvatarImg) {
      navAvatarImg.src = photoSrc;
      navAvatarImg.style.display = "block";
      navAvatarImg.onerror = function () {
        this.style.display = "none";
        if (navAvatarEl) {
          navAvatarEl.style.display = "flex";
          navAvatarEl.textContent = (displayName.charAt(0) || "👤").toUpperCase();
        }
      };
      if (navAvatarEl) navAvatarEl.style.display = "none";
    }
  } else {
    if (navAvatarEl) {
      navAvatarEl.style.display = "flex";
      navAvatarEl.textContent = (displayName.charAt(0) || "👤").toUpperCase();
    }
    if (navAvatarImg) navAvatarImg.style.display = "none";
  }
}

// Background sync to ensure profile photo and freshest user data are cached
async function syncUserProfile() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return;
  let user = null;
  try { user = JSON.parse(raw); } catch (e) { return; }
  if (!user || (!user.user_id && !user.username)) return;

  try {
    const res = await apiRequest(`/api/profile?user_id=${encodeURIComponent(user.user_id || '')}&username=${encodeURIComponent(user.username || '')}`);
    if (res && res.user) {
      const updatedUser = { ...user, ...res.user };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      renderNavbarUser(updatedUser);
    }
  } catch (err) {
    // Non-blocking background sync
  }
}

// Automatically initialize navbar user if elements exist
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    renderNavbarUser();
    syncUserProfile();
  });
} else {
  renderNavbarUser();
  syncUserProfile();
}

