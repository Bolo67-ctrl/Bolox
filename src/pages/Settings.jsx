import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase";

/*
  Keep the SAME admin UID you already use
  in AdminDashboard.jsx and Firestore rules.
*/
const ADMIN_UID = "YtzsZiecGMVXD5I4PEDVYj1c0uf1";

function Settings() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
      }
    );

    return unsubscribe;
  }, []);

  if (!authReady) {
    return (
      <main className="settings-page">
        <div className="profile-loading">
          Loading settings...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="settings-page">

        <section className="settings-login">

          <h1>
            SIGN IN
            <br />
            <span>REQUIRED.</span>
          </h1>

          <p>
            Sign in to manage your BOLO
            account settings.
          </p>

          <Link
            to="/"
            className="primary-btn"
          >
            ← Back Home
          </Link>

        </section>

      </main>
    );
  }

  const isAdmin =
    user.uid === ADMIN_UID;

  return (
    <main className="settings-page">

      <section className="settings-header">
      <h1>
          SETTINGS
          <br />
          <span>CENTER.</span>
        </h1>

        <p>
          Manage your BOLO account,
          purchases and available tools.
        </p>

      </section>

      <section className="settings-content">

        <div className="settings-grid">

          {/* PROFILE */}

          <Link
            to="/profile"
            className="settings-card"
          >
            <div className="settings-card-icon">
              👤
            </div>

            <span>
              ACCOUNT
            </span>

            <h2>
              Profile Settings
            </h2>

            <p>
              Manage your username,
              profile picture and bio.
            </p>

            <strong>
              Open Profile →
            </strong>
          </Link>

          {/* PURCHASES */}

          <Link
            to="/purchases"
            className="settings-card"
          >
            <div className="settings-card-icon">
              🛒
            </div>

            <span>
              PURCHASES
            </span>

            <h2>
              My Purchases
            </h2>

            <p>
              View pending, approved
              and rejected BOLO orders.
            </p>

            <strong>
              View Purchases →
            </strong>
          </Link>

          {/* ADMIN ONLY */}

          {isAdmin && (
            <Link
              to="/admin"
              className="settings-card admin-settings-card"
            >
              <div className="settings-card-icon">
                🛠️
              </div>

              <span>
                ADMIN
              </span>

              <h2>
                Admin Dashboard
              </h2>

              <p>
                Manage BOLO products,
                orders and customer access.
              </p>

              <strong>
                Open Dashboard →
              </strong>
            </Link>
          )}

        </div>

      </section>

    </main>
  );
}

export default Settings;