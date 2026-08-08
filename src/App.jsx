import {
  HashRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import "./App.css";

import Store from "./pages/Store";
import SensitivityGenerator from "./pages/SensitivityGenerator";
import Profile from "./pages/Profile";

import {
  auth,
  loginWithGoogle,
  logoutUser,
} from "./firebase";

function Navbar() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          const savedPhoto = localStorage.getItem(
            `bolox_profile_photo_${currentUser.uid}`
          );

          setProfilePhoto(
            savedPhoto || currentUser.photoURL || ""
          );
        } else {
          setProfilePhoto("");
        }
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      if (!auth.currentUser) return;

      const savedPhoto = localStorage.getItem(
        `bolox_profile_photo_${auth.currentUser.uid}`
      );

      setProfilePhoto(
        savedPhoto ||
        auth.currentUser.photoURL ||
        ""
      );
    };

    window.addEventListener(
      "bolox-profile-updated",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "bolox-profile-updated",
        handleStorage
      );
    };
  }, []);

  const handleLogin = async () => {
    try {
      setAuthError("");
      await loginWithGoogle();
    } catch (error) {
      console.error(error);

      setAuthError(
        `${error.code}: ${error.message}`
      );
    }
  };

  const handleLogout = async () => {
    try {
      setAuthError("");
      await logoutUser();
    } catch (error) {
      console.error(error);
      setAuthError("Could not log out.");
    }
  };

  return (
    <>
      <header className="navbar">

        <Link to="/" className="logo">
  <img
    src="/bolox-logo.jpeg"
    alt="BOLOX"
    className="bolox-logo-image"
  />
  <span>BOLOX</span>
</Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/store">Store</Link>
          <Link to="/community">
            Community
          </Link>
          <Link to="/premium">
            Premium
          </Link>

          {user && (
            <Link to="/profile">
              Profile
            </Link>
          )}
        </nav>

        <div className="nav-actions">

          {!user ? (
            <>
              <button
                className="login-btn"
                onClick={handleLogin}
              >
                Login with Google
              </button>

              <button
                className="signup-btn"
                onClick={handleLogin}
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="user-nav">

              <Link
                to="/profile"
                className="user-profile-link"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-fallback">
                    B
                  </div>
                )}

                <div className="user-info">
                  <strong>
                    {user.displayName ||
                      "BOLOX Player"}
                  </strong>

                  <small>
                    {user.email}
                  </small>
                </div>
              </Link>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>

            </div>
          )}

        </div>

      </header>

      {authError && (
        <div className="auth-error">
          {authError}
        </div>
      )}
    </>
  );
}

function Home() {
  return (
    <div className="bolox">

      <Navbar />

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            FREE FIRE GAMING PLATFORM
          </div>

          <h1>
            LEVEL UP
            <br />
            <span>WITH BOLOX</span>
          </h1>

          <p>
            Premium configs, sensitivity tools
            and gaming resources built for
            competitive Free Fire players.
          </p>

          <div className="hero-buttons">

            <Link
              to="/store"
              className="primary-btn"
            >
              Explore Store →
            </Link>

            <Link
              to="/premium"
              className="secondary-btn"
            >
              Join Premium
            </Link>

          </div>

        </div>

        <div className="hero-visual">

          <div className="glow"></div>

          <div className="bolox-card">

            <div className="card-top">
              <span>BOLOX</span>

              <span className="live-dot">
                ● LIVE
              </span>
            </div>

            <div className="card-logo">
              B
            </div>

            <div className="card-text">
              <small>
                COMPETITIVE GAMING
              </small>

              <h3>
                PLAY
                <br />
                BETTER.
              </h3>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

function Community() {
  return (
    <div className="simple-page">
      <Navbar />

      <h1>BOLOX COMMUNITY</h1>

      <p>
        Community features are coming soon.
      </p>
    </div>
  );
}

function Premium() {
  return (
    <div className="simple-page">
      <Navbar />

      <h1>BOLOX PREMIUM</h1>

      <p>
        Premium features are coming soon.
      </p>
    </div>
  );
}

function App() {
  return (
    <HashRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/store"
          element={
            <div className="bolox">
              <Navbar />
              <Store />
            </div>
          }
        />

        <Route
          path="/store/sensitivity"
          element={
            <>
              <Navbar />
              <SensitivityGenerator />
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <Profile />
            </>
          }
        />

        <Route
          path="/community"
          element={<Community />}
        />

        <Route
          path="/premium"
          element={<Premium />}
        />

      </Routes>

    </HashRouter>
  );
}

export default App;