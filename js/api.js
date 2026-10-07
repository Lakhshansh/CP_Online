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
