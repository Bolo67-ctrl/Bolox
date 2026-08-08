import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Store from "./pages/Store";
import SensitivityGenerator from "./pages/SensitivityGenerator";

function Home() {
  return (
    <div className="bolox">
      <header className="navbar">
        <a href="/" className="logo">
          <span>B</span> BOLOX
        </a>

        <nav>
          <a href="/">Home</a>
          <a href="/store">Store</a>
          <a href="/community">Community</a>
          <a href="/premium">Premium</a>
        </nav>

        <div className="nav-actions">
          <button className="login-btn">Login</button>
          <button className="signup-btn">Get Started</button>
        </div>
      </header>

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
            <a href="/store" className="primary-btn">
              Explore Store →
            </a>

            <a href="/premium" className="secondary-btn">
              Join Premium
            </a>
          </div>

        </div>

        <div className="hero-visual">
          <div className="glow"></div>

          <div className="bolox-card">

            <div className="card-top">
              <span>BOLOX</span>
              <span className="live-dot">● LIVE</span>
            </div>

            <div className="card-logo">
              B
            </div>

            <div className="card-text">
              <small>COMPETITIVE GAMING</small>

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

function App() {
  return (
    <BrowserRouter>

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
    <div className="bolox">
      <Store />
    </div>
  }
/>

        {/* SENSITIVITY GENERATOR */}
        <Route
          path="/store/sensitivity"
          element={<SensitivityGenerator />}
        />

        {/* COMMUNITY */}
        <Route
          path="/community"
          element={
            <div className="simple-page">
              <h1>BOLOX COMMUNITY</h1>
              <p>Community coming soon.</p>
            </div>
          }
        />

        {/* PREMIUM */}
        <Route
          path="/premium"
          element={
            <div className="simple-page">
              <h1>BOLOX PREMIUM</h1>
              <p>Premium coming soon.</p>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;