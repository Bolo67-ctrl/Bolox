import { useState } from "react";
import { Link } from "react-router-dom";

const products = [{
  id: 7,
  category: "free",
  icon: "🧪",
  title: "BOLOX Test File",
  description:
    "Test download used to verify BOLOX file delivery.",
  tags: ["TEST", "DOWNLOAD"],
  type: "download",
  file: "/downloads/cache_res.CfnFf59sr1SbsqQ6JqTKsEusjKs~3D",
  button: "Download Test File",
},
  {
    id: 1,
    category: "free",
    icon: "🎯",
    title: "Free Fire Sensitivity Generator",
    description:
      "Generate personalized Free Fire sensitivity settings based on your device and play style.",
    tags: ["FREE", "5 / DAY"],
    type: "page",
    link: "/store/sensitivity",
    button: "Generate Sensitivity",
  },

  {
    id: 2,
    category: "free",
    icon: "📦",
    title: "BOLOX Sensitivity Pack",
    description:
      "Download a BOLOX sensitivity preset pack for reference and customization.",
    tags: ["FREE", "DOWNLOAD"],
    type: "download",
    file: "/downloads/sensitivity-pack.json",
    button: "Download Pack",
  },

  {
    id: 3,
    category: "hud",
    icon: "🎮",
    title: "Free Fire HUD Layout",
    description:
      "Download a BOLOX HUD layout image that you can use as a reference when arranging your controls.",
    tags: ["HUD", "FREE"],
    type: "download",
    file: "/downloads/hud-layout.png",
    button: "Download HUD",
  },

  {
    id: 4,
    category: "guide",
    icon: "📘",
    title: "BOLOX Sensitivity Guide",
    description:
      "A downloadable guide explaining sensitivity categories and how to tune them for your play style.",
    tags: ["GUIDE", "PDF"],
    type: "download",
    file: "/downloads/sensitivity-guide.pdf",
    button: "Download Guide",
  },

  {
    id: 5,
    category: "optimization",
    icon: "📡",
    title: "BOLO AIM",
    description:
      "Install the BOLO AIM DNS profile for iPhone, designed for a reliable gaming network connection.",
    tags: ["IPHONE", "DNS", "FREE"],
    type: "download",
    file: "/bolo-aim.mobileconfig",
    button: "Install BOLO AIM",
  },

  {
    id: 6,
    category: "premium",
    icon: "⚡",
    title: "BOLOX Premium Resources",
    description:
      "Premium BOLOX resources and advanced customization packs.",
    tags: ["PREMIUM", "PROTECTED"],
    type: "premium",
    button: "View Premium",
  },
];

function Store() {
  const [activeCategory, setActiveCategory] =
    useState("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) =>
            product.category ===
            activeCategory
        );

  return (
    <main className="store-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="store-hero">

        <div className="store-hero-content">

          <span className="red-label">
            BOLOX STORE
          </span>

          <h1>
            LEVEL UP
            <br />
            <span>
              YOUR GAME.
            </span>
          </h1>

          <p>
            Explore BOLOX sensitivity tools,
            HUD resources, guides, downloads
            and optimization tools.
          </p>

        </div>

        <div className="store-counter">

          <span>
            FREE GENERATOR
          </span>

          <strong>
            5
          </strong>

          <small>
            GENERATIONS / DAY
          </small>

        </div>

      </section>

      {/* =====================================
          STORE CONTENT
      ===================================== */}

      <section className="store-content">

        {/* FILTER */}

        <div className="store-filter">

          <button
            type="button"
            className={
              activeCategory === "all"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory("all")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              activeCategory === "free"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory("free")
            }
          >
            Free Tools
          </button>

          <button
            type="button"
            className={
              activeCategory === "hud"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory("hud")
            }
          >
            HUD
          </button>

          <button
            type="button"
            className={
              activeCategory === "guide"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory("guide")
            }
          >
            Guides
          </button>

          <button
            type="button"
            className={
              activeCategory ===
              "optimization"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                "optimization"
              )
            }
          >
            Optimization
          </button>

          <button
            type="button"
            className={
              activeCategory === "premium"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                "premium"
              )
            }
          >
            Premium
          </button>

        </div>

        {/* PRODUCTS */}

        <div className="store-products">

          {filteredProducts.map(
            (product) => (

              <div
                className="store-product"
                key={product.id}
              >

                <div className="store-product-top">

                  <div className="store-product-icon">
                    {product.icon}
                  </div>

                  <span className="store-product-number">
                    {String(
                      product.id
                    ).padStart(2, "0")}
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

                    {product.tags.map(
                      (tag) => (
                        <span key={tag}>
                          {tag}
                        </span>
                      )
                    )}

                  </div>

                  {/* PAGE LINK */}

                  {product.type ===
                  "page" ? (

                    <Link
                      to={product.link}
                      className="store-action"
                    >
                      {product.button}
                      <span>→</span>
                    </Link>

                  ) : product.type ===
                    "download" ? (

                    /* FILE DOWNLOAD */

                    <a
                      href={product.file}
                      className="store-action"
                      download={
                        !product.file.endsWith(
                          ".mobileconfig"
                        )
                      }
                    >
                      {product.button}
                      <span>↓</span>
                    </a>

                  ) : (

                    /* PREMIUM */

                    <Link
                      to="/premium"
                      className="store-action"
                    >
                      {product.button}
                      <span>→</span>
                    </Link>

                  )}

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* =====================================
          BOLO AIM
      ===================================== */}

      <section className="bolo-aim-section">

        <div className="bolo-aim-card">

          <span className="red-label">
            IPHONE NETWORK TOOL
          </span>

          <div className="bolo-aim-icon">
            📡
          </div>

          <h2>
            BOLO <span>AIM</span>
          </h2>

          <p>
            Install the BOLO AIM DNS profile
            on your iPhone for a reliable
            gaming network setup.
          </p>

          <div className="bolo-aim-tags">

            <span>
              iOS
            </span>

            <span>
              DNS
            </span>

            <span>
              FREE
            </span>

          </div>

          <a
            href="/bolo-aim.mobileconfig"
            className="bolo-aim-button"
          >
            Install BOLO AIM ↓
          </a>

          <small>
            BOLO AIM changes DNS settings.
            It does not modify Free Fire
            aim or game files.
          </small>

        </div>

      </section>

      {/* =====================================
          GENERATOR FEATURE
      ===================================== */}

      <section className="generator-preview">

        <div className="generator-content">

          <span className="red-label">
            FREE FIRE ONLY
          </span>

          <h2>
            Your sensitivity.
            <br />
            <span>
              Your way.
            </span>
          </h2>

          <p>
            Choose your device and play
            style to generate a personalized
            sensitivity setup.
          </p>

          <div className="generator-info">

            <div>
              <strong>
                5
              </strong>

              <span>
                FREE GENERATIONS
              </span>
            </div>

            <div>
              <strong>
                FREE
              </strong>

              <span>
                TO USE
              </span>
            </div>

            <div>
              <strong>
                FF
              </strong>

              <span>
                ONLY
              </span>
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

              <span>
                BOLOX SENSITIVITY
              </span>

              <span>
                FREE FIRE
              </span>

            </div>

            <div className="setting-row">
              <span>
                General
              </span>

              <strong>
                187
              </strong>
            </div>

            <div className="setting-row">
              <span>
                Red Dot
              </span>

              <strong>
                174
              </strong>
            </div>

            <div className="setting-row">
              <span>
                2X Scope
              </span>

              <strong>
                161
              </strong>
            </div>

            <div className="setting-row">
              <span>
                4X Scope
              </span>

              <strong>
                148
              </strong>
            </div>

            <div className="setting-row">
              <span>
                Sniper Scope
              </span>

              <strong>
                92
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          PREMIUM
      ===================================== */}

      <section className="store-premium">

        <div>

          <span className="red-label">
            BOLOX PREMIUM
          </span>

          <h2>
            Premium
            <br />

            <span>
              resources.
            </span>
          </h2>

          <p>
            Premium downloads will use
            protected delivery so customers
            cannot simply guess a public file
            URL.
          </p>

        </div>

        <div className="premium-list">

          <div>
            <span>01</span>
            Premium resources
          </div>

          <div>
            <span>02</span>
            Protected downloads
          </div>

          <div>
            <span>03</span>
            Account purchases
          </div>

          <div>
            <span>04</span>
            Future updates
          </div>

        </div>

      </section>

      <div className="store-back">

        <Link to="/">
          ← Back to BOLOX Home
        </Link>

      </div>

    </main>
  );
}

export default Store;