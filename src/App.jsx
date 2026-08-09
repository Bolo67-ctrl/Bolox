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

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import "./App.css";

import Store from "./pages/Store";
import SensitivityGenerator from "./pages/SensitivityGenerator";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import PublicProfile from "./pages/PublicProfile";
import AimNeck from "./pages/AimNeck";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import MyPurchases from "./pages/MyPurchases";

import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
} from "./firebase";

/* =========================================
   NAVBAR
========================================= */

function Navbar() {
  const [user, setUser] =
    useState(null);

  const [authError, setAuthError] =
    useState("");

  const [profilePhoto, setProfilePhoto] =
    useState("");

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  /* AUTH */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);

          if (currentUser) {
            const savedPhoto =
              localStorage.getItem(
                `bolox_profile_photo_${currentUser.uid}`
              );

            setProfilePhoto(
              savedPhoto ||
                currentUser.photoURL ||
                ""
            );
          } else {
            setProfilePhoto("");
            setNotifications([]);
            setNotificationsOpen(false);
          }
        }
      );

    return unsubscribe;
  }, []);

  /* PROFILE PHOTO UPDATE */

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (!auth.currentUser) {
        return;
      }

      const savedPhoto =
        localStorage.getItem(
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
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "bolox-profile-updated",
        handleProfileUpdate
      );
    };
  }, []);

  /* =========================================
     LIVE NOTIFICATIONS
  ========================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    const notificationsQuery = query(
      collection(
        db,
        "users",
        user.uid,
        "notifications"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const loadedNotifications =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setNotifications(
            loadedNotifications
          );
        },
        (error) => {
          console.error(
            "Notification error:",
            error
          );
        }
      );

    return unsubscribe;
  }, [user]);

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  /* =========================================
     MARK ONE READ
  ========================================= */

  const markNotificationRead =
    async (notification) => {
      if (
        !user ||
        notification.read
      ) {
        return;
      }

      try {
        const notificationRef = doc(
          db,
          "users",
          user.uid,
          "notifications",
          notification.id
        );

        await updateDoc(
          notificationRef,
          {
            read: true,
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================
     MARK ALL READ
  ========================================= */

  const markAllNotificationsRead =
    async () => {
      if (!user) return;

      const unread =
        notifications.filter(
          (notification) =>
            !notification.read
        );

      if (unread.length === 0) {
        return;
      }

      try {
        await Promise.all(
          unread.map(
            (notification) =>
              updateDoc(
                doc(
                  db,
                  "users",
                  user.uid,
                  "notifications",
                  notification.id
                ),
                {
                  read: true,
                }
              )
          )
        );
      } catch (error) {
        console.error(error);
      }
    };

  /* =========================================
     NOTIFICATION LINK
  ========================================= */

  const getNotificationLink =
    (notification) => {
      if (
        notification.type ===
        "follow"
      ) {
        return `/player/${notification.actorId}`;
      }

      if (
        notification.type ===
          "like" ||
        notification.type ===
          "comment"
      ) {
        return "/community";
      }

      return "/profile";
    };

  /* =========================================
     LOGIN
  ========================================= */

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

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    try {
      setAuthError("");

      setNotificationsOpen(false);

      await logoutUser();
    } catch (error) {
      console.error(error);

      setAuthError(
        "Could not log out."
      );
    }
  };

  return (
    <>
      <header className="navbar">

        {/* LOGO */}

        <Link
          to="/"
          className="logo"
        >
          <img
            src="/bolox-logo.jpeg?v=2"
            alt="BOLOX"
            className="bolox-logo-image"
          />

          <span>
            BOLOX
          </span>
        </Link>

        {/* NAVIGATION */}

        <nav>

          <Link to="/">
            Home
          </Link>

          <Link to="/store">
            Store
          </Link>

          <Link to="/community">
            Community
          </Link>

          <Link to="/premium">
            Premium
          </Link>

          {user && (
            <>
              <Link to="/profile">
                Profile
              </Link>

              <Link to="/purchases">
                Purchases
              </Link>
            </>
          )}

        </nav>

        {/* RIGHT SIDE */}

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

              {/* NOTIFICATIONS */}

              <div className="notification-wrapper">

                <button
                  type="button"
                  className="notification-bell"
                  onClick={() =>
                    setNotificationsOpen(
                      (open) => !open
                    )
                  }
                  aria-label="Notifications"
                >
                  <span className="notification-bell-icon">
                    🔔
                  </span>

                  {unreadCount > 0 && (
                    <span className="notification-badge">

                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}

                    </span>
                  )}

                </button>

                {notificationsOpen && (
                  <div className="notification-dropdown">

                    <div className="notification-header">

                      <div>

                        <strong>
                          Notifications
                        </strong>

                        <span>
                          {unreadCount} unread
                        </span>

                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsRead
                          }
                        >
                          Mark all read
                        </button>
                      )}

                    </div>

                    <div className="notification-list">

                      {notifications.length ===
                      0 ? (

                        <div className="notification-empty">

                          <span>
                            🔔
                          </span>

                          <strong>
                            No notifications yet.
                          </strong>

                          <p>
                            New followers, likes
                            and comments will
                            appear here.
                          </p>

                        </div>

                      ) : (

                        notifications
                          .slice(0, 15)
                          .map(
                            (notification) => (

                              <Link
                                key={
                                  notification.id
                                }
                                to={getNotificationLink(
                                  notification
                                )}
                                className={
                                  notification.read
                                    ? "notification-item"
                                    : "notification-item unread"
                                }
                                onClick={() => {
                                  markNotificationRead(
                                    notification
                                  );

                                  setNotificationsOpen(
                                    false
                                  );
                                }}
                              >

                                <div className="notification-avatar">

                                  {notification.type ===
                                  "follow"
                                    ? "👤"
                                    : notification.type ===
                                        "like"
                                      ? "❤️"
                                      : notification.type ===
                                          "comment"
                                        ? "💬"
                                        : "🔔"}

                                </div>

                                <div className="notification-content">

                                  <p>

                                    <strong>
                                      {notification.actorName ||
                                        "BOLOX Player"}
                                    </strong>{" "}

                                    {notification.message ||
                                      "sent you a notification."}

                                  </p>

                                  <small>

                                    {notification.type ===
                                    "follow"
                                      ? "New follower"
                                      : notification.type ===
                                          "like"
                                        ? "New like"
                                        : notification.type ===
                                            "comment"
                                          ? "New comment"
                                          : "BOLOX"}

                                  </small>

                                </div>

                                {!notification.read && (
                                  <span className="notification-unread-dot" />
                                )}

                              </Link>

                            )
                          )

                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* PROFILE */}

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

/* =========================================
   FOOTER
========================================= */

function Footer() {
  return (
    <footer className="bolox-footer">

      <div className="footer-top">

        <div className="footer-brand">

          <img
            src="/bolox-logo.jpeg?v=2"
            alt="BOLOX"
          />

          <div>

            <strong>
              BOLOX
            </strong>

            <span>
              LEVEL UP YOUR GAME
            </span>

          </div>

        </div>

        <div className="footer-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/store">
            Store
          </Link>

          <Link to="/community">
            Community
          </Link>

          <Link to="/premium">
            Premium
          </Link>

        </div>

      </div>

      <div className="footer-line" />

      <div className="footer-bottom">

        <p>
          © 2026 BOLOX. All Rights Reserved.
        </p>

        <p className="footer-disclaimer">
          BOLOX is an independent gaming
          platform and is not affiliated with
          or endorsed by Garena or Free Fire.
        </p>

      </div>

    </footer>
  );
}

/* =========================================
   PAGE LAYOUT
========================================= */

function PageLayout({ children }) {
  return (
    <div className="bolox">

      <Navbar />

      {children}

      <Footer />

    </div>
  );
}

/* =========================================
   HOME
========================================= */

function Home() {
  return (
    <PageLayout>

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            FREE FIRE GAMING PLATFORM
          </div>

          <h1>
            LEVEL UP
            <br />

            <span>
              WITH BOLOX
            </span>
          </h1>

          <p>
            Premium configs, sensitivity
            tools and gaming resources built
            for competitive Free Fire players.
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

          <div className="glow" />

          <div className="bolox-card">

            <div className="card-top">

              <span>
                BOLOX
              </span>

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

    </PageLayout>
  );
}

/* =========================================
   PREMIUM
========================================= */

function Premium() {
  return (
    <PageLayout>

      <main className="simple-page">

        <span className="red-label">
          BOLOX PREMIUM
        </span>

        <h1>
          LEVEL UP.
        </h1>

        <p>
          Premium features are coming soon.
        </p>

      </main>

    </PageLayout>
  );
}

/* =========================================
   APP
========================================= */

function App() {
  return (
    <HashRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* STORE */}

        <Route
          path="/store"
          element={
            <PageLayout>
              <Store />
            </PageLayout>
          }
        />

        {/* SENSITIVITY */}

        <Route
          path="/store/sensitivity"
          element={
            <PageLayout>
              <SensitivityGenerator />
            </PageLayout>
          }
        />

        {/* AIM NECK */}

        <Route
          path="/store/aim-neck"
          element={
            <PageLayout>
              <AimNeck />
            </PageLayout>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <PageLayout>
              <Profile />
            </PageLayout>
          }
        />

        {/* PURCHASES */}

        <Route
          path="/purchases"
          element={
            <PageLayout>
              <MyPurchases />
            </PageLayout>
          }
        />

        {/* COMMUNITY */}

        <Route
          path="/community"
          element={
            <PageLayout>
              <Community />
            </PageLayout>
          }
        />

        {/* PUBLIC PROFILE */}

        <Route
          path="/player/:userId"
          element={
            <PageLayout>
              <PublicProfile />
            </PageLayout>
          }
        />

        {/* ===============================
            ADMIN DASHBOARD
        =============================== */}

        <Route
          path="/admin"
          element={
            <PageLayout>
              <AdminDashboard />
            </PageLayout>
          }
        />

        {/* ADMIN ORDERS */}

        <Route
          path="/admin/orders"
          element={
            <PageLayout>
              <AdminOrders />
            </PageLayout>
          }
        />

        {/* PREMIUM */}

        <Route
          path="/premium"
          element={<Premium />}
        />

      </Routes>

    </HashRouter>
  );
}

export default App;