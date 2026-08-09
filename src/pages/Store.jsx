import { useState } from "react";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    category: "premium",
    icon: "🎯",
    title: "Aim Neck 80%",
    description:
      "BOLO product made for iPhone devices running iOS 17 through iOS 26.0.",
    tags: ["IPHONE", "iOS 17–26.0", "BOLO"],
    type: "page",
link: "/store/aim-neck",
price: "$20",
button: "View Product",
  },

  {
    id: 2,
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
    id: 3,
    category: "free",
    icon: "📦",
    title: "BOLO Sensitivity Pack",
    description:
      "Download a BOLO sensitivity preset pack for reference and customization.",
    tags: ["FREE", "DOWNLOAD"],
    type: "download",
    file: "/downloads/sensitivity-pack.json",
    button: "Download Pack",
  },

  {
    id: 4,
    category: "hud",
    icon: "🎮",
    title: "Free Fire HUD Layout",
    description:
      "Download a BOLO HUD layout image that you can use as a reference when arranging your controls.",
    tags: ["HUD", "FREE"],
    type: "download",
    file: "/downloads/hud-layout.png",
    button: "Download HUD",
  },

  {
    id: 5,
    category: "guide",
    icon: "📘",
    title: "BOLO Sensitivity Guide",
    description:
      "A downloadable guide explaining sensitivity categories and how to tune them for your play style.",
    tags: ["GUIDE", "PDF"],
    type: "download",
    file: "/downloads/sensitivity-guide.pdf",
    button: "Download Guide",
  },

  {
    id: 6,
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
    id: 7,
    category: "free",
    icon: "🧪",
    title: "BOLO Test File",
    description:
      "Test download used to verify BOLO file delivery.",
    tags: ["TEST", "DOWNLOAD"],
    type: "download",
    file: "/downloads/cache_res.CfnFf59sr1SbsqQ6JqTKsEusjKs~3D",
    button: "Download Test File",
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

      {/* HERO */}

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
            Explore BOLO products,
            sensitivity tools, HUD resources,
            guides and downloads.
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

      {/* STORE */}

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
              activeCategory === "premium"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory("premium")
            }
          >
            Premium
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

                  {product.price && (
                    <div className="store-product-price">
                      {product.price}
                    </div>
                  )}

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

                  ) : product.type ===
                    "paid" ? (

                    <button
                      type="button"
                      className="store-action"
                      disabled
                    >
                      {product.button}
                      <span>→</span>
                    </button>

                  ) : null}

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* BOLO AIM */}

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

            <span>iOS</span>
            <span>DNS</span>
            <span>FREE</span>

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

      {/* GENERATOR */}

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
              <strong>5</strong>
              <span>
                FREE GENERATIONS
              </span>
            </div>

            <div>
              <strong>FREE</strong>
              <span>
                TO USE
              </span>
            </div>

            <div>
              <strong>FF</strong>
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
                BOLO SENSITIVITY
              </span>

              <span>
                FREE FIRE
              </span>

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
            BOLO PREMIUM
          </span>

          <h2>
            Premium
            <br />
            <span>
              products.
            </span>
          </h2>

          <p>
            Premium BOLO products with
            protected payment and delivery.
          </p>

        </div>

        <div className="premium-list">

          <div>
            <span>01</span>
            Aim Neck 80%
          </div>

          <div>
            <span>02</span>
            Protected purchase
          </div>

          <div>
            <span>03</span>
            Account purchase history
          </div>

          <div>
            <span>04</span>
            Protected product delivery
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