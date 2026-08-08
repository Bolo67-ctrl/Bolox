import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxSize = 320;

        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        resolve(compressed);
      };

      img.onerror = () =>
        reject(new Error("Could not process image."));

      img.src = reader.result;
    };

    reader.onerror = () =>
      reject(new Error("Could not read image."));

    reader.readAsDataURL(file);
  });
}

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const [localPhoto, setLocalPhoto] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          setNewName(currentUser.displayName || "");

          const savedPhoto = localStorage.getItem(
            `bolox_profile_photo_${currentUser.uid}`
          );

          if (savedPhoto) {
            setLocalPhoto(savedPhoto);
            setPreviewPhoto(savedPhoto);
          } else {
            setPreviewPhoto(currentUser.photoURL || "");
          }
        }
      }
    );

    return unsubscribe;
  }, []);

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Please choose an image smaller than 8 MB.");
      return;
    }

    try {
      const compressed = await compressImage(file);

      setPreviewPhoto(compressed);
    } catch (err) {
      console.error(err);
      setError("Could not process this image.");
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;

    setMessage("");
    setError("");

    if (!newName.trim()) {
      setError("Your BOLOX name cannot be empty.");
      return;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: newName.trim(),
      });

      if (previewPhoto) {
        localStorage.setItem(
          `bolox_profile_photo_${auth.currentUser.uid}`,
          previewPhoto
        );

        setLocalPhoto(previewPhoto);
      }

      await auth.currentUser.reload();

      setUser({ ...auth.currentUser });

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err.message || "Could not update your profile."
      );
    }
  };

  const handleRemovePhoto = () => {
    if (!user) return;

    localStorage.removeItem(
      `bolox_profile_photo_${user.uid}`
    );

    setLocalPhoto("");
    setPreviewPhoto(user.photoURL || "");
    setMessage("Custom BOLOX profile photo removed.");
    setError("");
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-login-required">

          <span className="red-label">
            BOLOX ACCOUNT
          </span>

          <h1>
            SIGN IN
            <br />
            <span>REQUIRED.</span>
          </h1>

          <p>
            Sign in with Google to access your BOLOX
            profile and saved content.
          </p>

          <Link to="/" className="profile-home-btn">
            ← Back Home
          </Link>

        </div>
      </main>
    );
  }

  const displayedPhoto =
    previewPhoto ||
    localPhoto ||
    user.photoURL ||
    "";

  return (
    <main className="profile-page">

      <section className="profile-header">

        <div>

          <span className="red-label">
            BOLOX PROFILE
          </span>

          <h1>
            YOUR
            <br />
            <span>ACCOUNT.</span>
          </h1>

          <p>
            Manage your BOLOX identity,
            sensitivities, purchases and account status.
          </p>

        </div>

        <div className="profile-card">

          {displayedPhoto ? (
            <img
              src={displayedPhoto}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-fallback">
              B
            </div>
          )}

          {!editing ? (
            <>
              <h2>
                {user.displayName || "BOLOX Player"}
              </h2>

              <p>{user.email}</p>

              <span className="profile-plan">
                FREE MEMBER
              </span>

              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");

                  setNewName(
                    user.displayName || ""
                  );

                  setPreviewPhoto(
                    localPhoto ||
                    user.photoURL ||
                    ""
                  );
                }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div className="profile-editor">

              <label htmlFor="profile-name">
                BOLOX Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={newName}
                maxLength={24}
                onChange={(e) =>
                  setNewName(e.target.value)
                }
                placeholder="Enter your BOLOX name"
              />

              <label>
                Profile Picture
              </label>

              <label
                htmlFor="profile-photo-upload"
                className="photo-upload-btn"
              >
                Choose Photo
              </label>

              <input
                id="profile-photo-upload"
                className="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
              />

              <small className="profile-editor-note">
                Choose a photo from your phone or computer.
                BOLOX will compress it and save it on this device.
              </small>

              {localPhoto && (
                <button
                  type="button"
                  className="remove-photo-btn"
                  onClick={handleRemovePhoto}
                >
                  Remove Custom Photo
                </button>
              )}

              <div className="profile-editor-actions">

                <button
                  type="button"
                  className="save-profile-btn"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  className="cancel-profile-btn"
                  onClick={() => {
                    setEditing(false);

                    setNewName(
                      user.displayName || ""
                    );

                    setPreviewPhoto(
                      localPhoto ||
                      user.photoURL ||
                      ""
                    );

                    setError("");
                  }}
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

          {message && (
            <div className="profile-success">
              {message}
            </div>
          )}

          {error && (
            <div className="profile-edit-error">
              {error}
            </div>
          )}

        </div>

      </section>

      <section className="profile-dashboard">

        <div className="profile-stat-card">
          <span>ACCOUNT</span>
          <strong>FREE</strong>
          <small>Current Plan</small>
        </div>

        <div className="profile-stat-card">
          <span>SENSITIVITY</span>
          <strong>5</strong>
          <small>Daily Free Generations</small>
        </div>

        <div className="profile-stat-card">
          <span>SAVED</span>
          <strong>0</strong>
          <small>Saved Sensitivities</small>
        </div>

        <div className="profile-stat-card">
          <span>PURCHASES</span>
          <strong>0</strong>
          <small>Owned Products</small>
        </div>

      </section>

      <section className="profile-sections">

        <div className="profile-section-card">

          <div>

            <span className="red-label">
              SAVED SETTINGS
            </span>

            <h2>My Sensitivities</h2>

            <p>
              Your saved Free Fire sensitivity setups
              will appear here.
            </p>

          </div>

          <Link
            to="/store/sensitivity"
            className="profile-action"
          >
            Generate Sensitivity →
          </Link>

        </div>

        <div className="profile-section-card">

          <div>

            <span className="red-label">
              PREMIUM
            </span>

            <h2>Upgrade BOLOX</h2>

            <p>
              Unlock unlimited generations,
              premium configs and exclusive
              BOLOX features.
            </p>

          </div>

          <Link
            to="/premium"
            className="profile-action"
          >
            View Premium →
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Profile;