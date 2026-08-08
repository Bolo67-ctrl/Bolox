import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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
            Manage your BOLOX identity, sensitivities,
            purchases and account status.
          </p>
        </div>

        <div className="profile-card">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-fallback">
              B
            </div>
          )}

          <h2>
            {user.displayName || "BOLOX Player"}
          </h2>

          <p>{user.email}</p>

          <span className="profile-plan">
            FREE MEMBER
          </span>
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
              Unlock unlimited generations, premium
              configs and exclusive BOLOX features.
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