import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import styles from "../styles/updateProfile.module.css";
import API_CONFIG from "../config/api.config";

const UserUpdateProfile = () => {
  const [profileData, setProfileData] = useState({
    username: "",
    contact: "",
    profilePicPath: "",
  });
  const [newUsername, setNewUsername] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const backendURL = API_CONFIG.BACKEND_URL || "http://localhost:3000/";
  const updateURL = `${backendURL}/user/update/profile`;

  // Fetch existing user data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${backendURL}/user/getYourProfile`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success && data.buyer) {
        setProfileData({
          username: data.buyer.username || "No username",
          contact: data.buyer.contact || "No Contact",
          profilePicPath: data.buyer.profilePicPath || "",
        });
      } else {
        alert("Failed to load profile data");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePic(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    let hasUpdates = false;

    if (newUsername.trim() !== "") {
      formData.append("username", newUsername);
      hasUpdates = true;
    }

    const phoneRegex = /^(\+91[-\s]?|0)?[6-9]\d{9}$/;
    if (phoneRegex.test(newContact)) {
      formData.append("contact", newContact);
      hasUpdates = true;
    } else if (newContact.trim() !== "") {
      alert("Please enter a valid Indian phone number");
      return;
    }

    if (newProfilePic) {
      formData.append("profilePic", newProfilePic);
      hasUpdates = true;
    }

    if (!hasUpdates) {
      alert("Please make at least one change to update");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(updateURL, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update success:", result);
        alert("Profile updated successfully!");
        // Reset form and reload profile data
        setNewUsername("");
        setNewContact("");
        setNewProfilePic(null);
        setPreviewImage(null);
        fetchProfile();
      } else {
        alert("Update failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.window}>
        <ProfileHeader />
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <span className={styles.loadingText}>Loading your profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.window}>
      <ProfileHeader />
      <div className={styles.container}>
        <h2 className={styles.title}>Update Profile</h2>

        <div className={styles.profileSection}>
          <div className={styles.imageSection}>
            <h4>Previous Profile Picture</h4>
            <img
              className={styles.profileImage}
              src={
                profileData.profilePicPath
                  ? `${backendURL}/${profileData.profilePicPath}`
                  : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              alt="Profile"
            />
          </div>
          <div className={styles.imageSection}>
            <h4>New Profile Picture</h4>
            {previewImage ? (
              <img
                className={styles.profileImage}
                src={previewImage}
                alt="Preview"
              />
            ) : (
              <div className={styles.placeholderImage}>No image selected</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Previous Username</label>
          <div className={styles.previous}>{profileData.username}</div>
          <label className={styles.label}>New Username</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter new username"
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Previous Contact</label>
          <div className={styles.previous}>{profileData.contact}</div>
          <label className={styles.label}>New Contact</label>
          <input
            type="tel"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            placeholder="Enter new contact"
            className={styles.input}
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className={styles.updateBtn}
        >
          {updating ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
};

export default UserUpdateProfile;
