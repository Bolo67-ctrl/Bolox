import {
  HashRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import "./App.css";

import Store from "./pages/Store";
import SensitivityGenerator from "./pages/SensitivityGenerator";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span>B</span> BOLOX
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/store">Store</Link>
        <Link to="/community">Community</Link>
        <Link to="/premium">Premium</Link>
      </nav>

      <div className="nav-actions">
        <button className="login-btn">
          Login
        </button>

        <button className="signup-btn">
          Get Started
        </button>
      </div>
    </header>
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
            Premium configs, sensitivity tools and gaming
            resources built for competitive Free Fire players.
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
      <p>Community coming soon.</p>
    </div>
  );
}

function Premium() {
  return (
    <div className="simple-page">
      <Navbar />

      <h1>BOLOX PREMIUM</h1>
      <p>Premium coming soon.</p>
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
            <SensitivityGenerator />
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