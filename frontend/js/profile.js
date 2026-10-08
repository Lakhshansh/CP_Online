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
    window.location.href = "./index.html";
    return;
  }

  // Handle Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await apiRequest("/api/logout", { method: "POST" });
      } catch (err) {
        // Continue
      }
      localStorage.removeItem("currentUser");
      window.location.href = "./index.html";
    });
  }

  // Populate initially from localStorage
  populateProfileUI(user);

  // Fetch live detailed profile from API
  try {
    const res = await apiRequest(`/api/profile?user_id=${encodeURIComponent(user.user_id || '')}&username=${encodeURIComponent(user.username || '')}`);
    if (res && res.user) {
      user = { ...user, ...res.user };
      localStorage.setItem("currentUser", JSON.stringify(user));
      populateProfileUI(user);
    }
  } catch (error) {
    console.warn("Could not fetch detailed profile from API:", error);
  }

  // Photo Input Preview Logic
  const photoInput = document.getElementById("profilePhotoInput");
  const photoFileName = document.getElementById("photoFileName");
  const savePhotoBtn = document.getElementById("savePhotoBtn");
  const previewImg = document.getElementById("profilePreview");

  if (photoInput) {
    photoInput.addEventListener("change", function () {
      const file = this.files && this.files[0];
      if (!file) {
        photoFileName.textContent = "No photo selected";
        savePhotoBtn.disabled = true;
        return;
      }

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        alert("Please select a JPG, JPEG, PNG or WEBP image.");
        this.value = "";
        photoFileName.textContent = "No photo selected";
        savePhotoBtn.disabled = true;
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Photo size must be 5 MB or less.");
        this.value = "";
        photoFileName.textContent = "No photo selected";
        savePhotoBtn.disabled = true;
        return;
      }

      photoFileName.textContent = file.name;
      savePhotoBtn.disabled = false;

      const reader = new FileReader();
      reader.onload = function (e) {
        if (previewImg) {
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Photo Upload Submission
  const uploadForm = document.getElementById("uploadPhotoForm");
  const pageAlert = document.getElementById("profileAlert");

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const file = photoInput.files && photoInput.files[0];
      if (!file) return;

      savePhotoBtn.disabled = true;
      savePhotoBtn.textContent = "Uploading...";

      const formData = new FormData();
      formData.append("profile_photo", file);
      formData.append("user_id", user.user_id || "");
      formData.append("username", user.username || "");

      try {
        const response = await fetch(`${API_BASE_URL}/api/upload-profile-photo`, {
          method: "POST",
          body: formData,
          credentials: "include"
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Upload failed");
        }

        user.profile_photo = data.filename;
        localStorage.setItem("currentUser", JSON.stringify(user));
        populateProfileUI(user);

        if (pageAlert) {
          pageAlert.hidden = false;
          pageAlert.className = "alert alert-success mb-3";
          pageAlert.textContent = "✅ Profile photo uploaded successfully!";
          setTimeout(() => { pageAlert.hidden = true; }, 4000);
        }
      } catch (err) {
        alert(err.message || "Failed to upload photo.");
      } finally {
        savePhotoBtn.disabled = false;
        savePhotoBtn.textContent = "✅ Upload & Save Photo";
      }
    });
  }

  // Edit Profile Form Submission
  const editForm = document.getElementById("editProfileForm");
  const modalAlert = document.getElementById("modalAlert");

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (modalAlert) {
        modalAlert.hidden = true;
        modalAlert.textContent = "";
      }

      const btnSave = document.getElementById("btnSaveProfile");
      btnSave.disabled = true;
      btnSave.textContent = "Saving...";

      const updatedPayload = {
        user_id: user.user_id,
        username: user.username,
        doctor_name: document.getElementById("editDoctorName").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        phone: document.getElementById("editPhone").value.trim(),
        hospital_name: document.getElementById("editHospitalName").value.trim(),
        doctor_specialization: document.getElementById("editSpecialization").value.trim(),
        registration_number: document.getElementById("editRegistration").value.trim(),
        hospital_address: document.getElementById("editAddress").value.trim(),
        city: document.getElementById("editCity").value.trim(),
        state: document.getElementById("editState").value.trim()
      };

      try {
        const res = await apiRequest("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPayload)
        });

        if (res && res.user) {
          user = { ...user, ...res.user };
        } else {
          user = { ...user, ...updatedPayload };
        }
        localStorage.setItem("currentUser", JSON.stringify(user));
        populateProfileUI(user);

        const modalEl = document.getElementById("editProfileModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        if (pageAlert) {
          pageAlert.hidden = false;
          pageAlert.className = "alert alert-success mb-3";
          pageAlert.textContent = res.message || "Profile updated successfully!";
          setTimeout(() => { pageAlert.hidden = true; }, 4000);
        }
      } catch (err) {
        if (modalAlert) {
          modalAlert.hidden = false;
          modalAlert.textContent = err.message || "Failed to update profile.";
        }
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Save Changes";
      }
    });
  }
});

function populateProfileUI(user) {
  if (!user) return;

  const uname = user.username || "User";
  const email = user.email || "No email registered";
  const role = user.role || "Admin";

  const topUnameEl = document.getElementById("topUsername");
  if (topUnameEl) topUnameEl.textContent = uname;
  const topEmailEl = document.getElementById("topEmail");
  if (topEmailEl) topEmailEl.textContent = email;
  const topRoleEl = document.getElementById("topRole");
  if (topRoleEl) topRoleEl.textContent = role;

  const navUserEl = document.getElementById("navUsername");
  if (navUserEl) navUserEl.textContent = uname;
  const navRoleEl = document.getElementById("navRole");
  if (navRoleEl) navRoleEl.textContent = role;

  // Profile photo handling
  const previewImg = document.getElementById("profilePreview");
  const navAvatarImg = document.getElementById("navAvatarImg");
  const navAvatar = document.getElementById("navAvatar");

  if (user.profile_photo) {
    const photoSrc = user.profile_photo.startsWith("http") || user.profile_photo.startsWith("data:")
      ? user.profile_photo
      : `${API_BASE_URL}/static/profile_photos/${user.profile_photo}`;

    if (previewImg) previewImg.src = photoSrc;
    if (navAvatarImg) {
      navAvatarImg.src = photoSrc;
      navAvatarImg.style.display = "block";
      if (navAvatar) navAvatar.style.display = "none";
    }
  } else {
    if (previewImg) previewImg.src = "./images/logo.png";
    if (navAvatar) {
      navAvatar.style.display = "flex";
      navAvatar.textContent = (uname.charAt(0) || "👤").toUpperCase();
    }
    if (navAvatarImg) navAvatarImg.style.display = "none";
  }

  // 8 Information Boxes (matching original template exactly)
  setFieldText("valUsername", uname);
  setFieldText("valEmail", user.email);
  setFieldText("valPhone", user.phone);
  setFieldText("valHospital", user.hospital_name);
  setFieldText("valDoctor", user.doctor_name);
  setFieldText("valSpec", user.doctor_specialization);
  setFieldText("valRole", role);
  setFieldText("valUserId", user.user_id ? `#${user.user_id}` : "-");

  // Populate edit modal fields
  setInputValue("editDoctorName", user.doctor_name);
  setInputValue("editEmail", user.email);
  setInputValue("editPhone", user.phone);
  setInputValue("editHospitalName", user.hospital_name);
  setInputValue("editSpecialization", user.doctor_specialization);
  setInputValue("editRegistration", user.registration_number);
  setInputValue("editAddress", user.hospital_address);
  setInputValue("editCity", user.city);
  setInputValue("editState", user.state);
}

function setFieldText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (value && String(value).trim()) {
    el.textContent = value;
  } else {
    el.textContent = "Not Available";
  }
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || "";
}
