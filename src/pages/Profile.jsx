import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhotoURL, setNewPhotoURL] = useState("");

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
          setNewPhotoURL(currentUser.photoURL || "");
        }
      }
    );

    return unsubscribe;
  }, []);

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
        photoURL: newPhotoURL.trim() || null,
      });

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

  const currentPhoto =
    newPhotoURL.trim() || user.photoURL;

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
            sensitivities, purchases and
            account status.
          </p>

        </div>

        <div className="profile-card">

          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt="Profile"
              className="profile-avatar"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
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

              <label htmlFor="profile-photo">
                Profile Image URL
              </label>

              <input
                id="profile-photo"
                type="url"
                value={newPhotoURL}
                onChange={(e) =>
                  setNewPhotoURL(e.target.value)
                }
                placeholder="https://..."
              />

              <small className="profile-editor-note">
                Paste a direct image URL for your
                profile picture.
              </small>

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
                    setNewPhotoURL(
                      user.photoURL || ""
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
              Your saved Free Fire sensitivity
              setups will appear here.
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