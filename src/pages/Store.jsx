import { useState } from "react";
import { Link } from "react-router-dom";

function Store() {

  const [activeCategory, setActiveCategory] = useState("all");

  const products = [
    {
      id: 1,
      category: "free",
      icon: "🎯",
      title: "Free Fire Sensitivity Generator",
      description:
        "Generate personalized Free Fire sensitivity settings based on your device and play style.",
      tags: ["FREE", "5 / DAY"],
      button: "Generate Sensitivity",
    },
    {
      id: 2,
      category: "premium",
      icon: "⚡",
      title: "BOLOX Premium Configs",
      description:
        "Premium configurations designed for competitive Free Fire players.",
      tags: ["PREMIUM", "UPDATED"],
      button: "View Configs",
    },
    {
      id: 3,
      category: "hud",
      icon: "🎮",
      title: "Free Fire HUD Layouts",
      description:
        "Browse pre-made HUD layouts organized by play style and finger setup.",
      tags: ["HUD", "FREE & PREMIUM"],
      button: "Browse HUDs",
    },
    {
      id: 4,
      category: "optimization",
      icon: "⚙️",
      title: "Device Optimization",
      description:
        "Find recommended settings and optimization resources for your device.",
      tags: ["ANDROID", "IOS"],
      button: "Explore",
    },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) => product.category === activeCategory
        );

  return (
    <main className="store-page">

      {/* STORE HERO */}

      <section className="store-hero">

        <div className="store-hero-content">

          <span className="red-label">
            BOLOX STORE
          </span>

          <h1>
            LEVEL UP
            <br />
            <span>YOUR GAME.</span>
          </h1>

          <p>
            Explore BOLOX tools, configs, HUD layouts and
            optimization resources built for Free Fire players.
          </p>

        </div>

        <div className="store-counter">

          <span>FREE GENERATOR</span>

          <strong>
            5
          </strong>

          <small>
            GENERATIONS / DAY
          </small>

        </div>

      </section>


      {/* CATEGORY FILTER */}

      <section className="store-content">

        <div className="store-filter">

          <button
            className={
              activeCategory === "all"
                ? "filter-active"
                : ""
            }
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>

          <button
            className={
              activeCategory === "free"
                ? "filter-active"
                : ""
            }
            onClick={() => setActiveCategory("free")}
          >
            Free Tools
          </button>

          <button
            className={
              activeCategory === "premium"
                ? "filter-active"
                : ""
            }
            onClick={() => setActiveCategory("premium")}
          >
            Premium
          </button>

          <button
            className={
              activeCategory === "hud"
                ? "filter-active"
                : ""
            }
            onClick={() => setActiveCategory("hud")}
          >
            HUD Layouts
          </button>

          <button
            className={
              activeCategory === "optimization"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory("optimization")
            }
          >
            Optimization
          </button>

        </div>


        {/* PRODUCTS */}

        <div className="store-products">

          {filteredProducts.map((product) => (

            <div
              className="store-product"
              key={product.id}
            >

              <div className="store-product-top">

                <div className="store-product-icon">
                  {product.icon}
                </div>

                <span className="store-product-number">
                  0{product.id}
                </span>

              </div>

              <div className="store-product-info">

                <h2>
                  {product.title}
                </h2>

                <p>
                  {product.description}
                </p>

              </div>

              <div className="store-product-bottom">

                <div className="store-tags">

                  {product.tags.map((tag) => (
                    <span key={tag}>
                      {tag}
                    </span>
                  ))}

                </div>

                {product.category === "free" ? (
                  <Link
                    to="/store/sensitivity"
                    className="store-action"
                  >
                    {product.button}
                    <span>→</span>
                  </Link>
                ) : (
                  <button className="store-action">
                    {product.button}
                    <span>→</span>
                  </button>
                )}

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* FREE SENSITIVITY FEATURE */}

      <section className="generator-preview">

        <div className="generator-content">

          <span className="red-label">
            FREE FIRE ONLY
          </span>

          <h2>
            Your sensitivity.
            <br />
            <span>Your way.</span>
          </h2>

          <p>
            BOLOX will analyze your device and play style
            to create a personalized Free Fire sensitivity setup.
          </p>

          <div className="generator-info">

            <div>
              <strong>5</strong>
              <span>FREE GENERATIONS</span>
            </div>

            <div>
              <strong>FREE</strong>
              <span>TO USE</span>
            </div>

            <div>
              <strong>FF</strong>
              <span>ONLY</span>
            </div>

          </div>

          <Link
  to="/store/sensitivity"
  className="generator-button"
>
  Start Generator →
</Link>
        </div>


        <div className="generator-visual">

          <div className="settings-card">

            <div className="settings-header">
              <span>BOLOX SENSITIVITY</span>
              <span>FREE FIRE</span>
            </div>

            <div className="setting-row">
              <span>General</span>
              <strong>187</strong>
            </div>

            <div className="setting-row">
              <span>Red Dot</span>
              <strong>174</strong>
            </div>

            <div className="setting-row">
              <span>2X Scope</span>
              <strong>161</strong>
            </div>

            <div className="setting-row">
              <span>4X Scope</span>
              <strong>148</strong>
            </div>

            <div className="setting-row">
              <span>Sniper Scope</span>
              <strong>92</strong>
            </div>

          </div>

        </div>

      </section>


      {/* PREMIUM */}

      <section className="store-premium">

        <div>

          <span className="red-label">
            BOLOX PREMIUM
          </span>

          <h2>
            Unlock the
            <br />
            <span>full experience.</span>
          </h2>

          <p>
            Get access to exclusive configurations,
            premium HUD layouts and additional BOLOX tools.
          </p>

        </div>

        <div className="premium-list">

          <div>
            <span>01</span>
            Unlimited sensitivity generations
          </div>

          <div>
            <span>02</span>
            Premium configurations
          </div>

          <div>
            <span>03</span>
            Exclusive HUD layouts
          </div>

          <div>
            <span>04</span>
            Early access to new tools
          </div>

        </div>

      </section>


      {/* BACK HOME */}

      <div className="store-back">

        <Link to="/">
          ← Back to BOLOX Home
        </Link>

      </div>

    </main>
  );
}

export default Store;
<div className="bolo-aim-card">
  <h2>BOLO AIM</h2>

  <p>
    Gaming DNS profile designed to help improve network reliability on iPhone.
  </p>

  <a
    href="/bolo-aim.mobileconfig"
    className="bolo-aim-button"
  >
    Install BOLO AIM
  </a>
</div>