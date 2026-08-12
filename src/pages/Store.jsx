import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "../firebase";

/* =========================================
   BUILT-IN BOLO PRODUCTS
========================================= */

/* =========================================
   HELPERS
========================================= */

function normalizeTitle(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatPrice(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const price =
    String(value).trim();

  if (
    price.startsWith("$")
  ) {
    return price;
  }

  return `$${price}`;
}

function createTags(product) {
  if (
    Array.isArray(
      product.tags
    ) &&
    product.tags.length > 0
  ) {
    return product.tags;
  }

  const tags = [];

  if (product.device) {
    tags.push(
      String(
        product.device
      ).toUpperCase()
    );
  }

  if (
    product.compatibility
  ) {
    tags.push(
      product.compatibility
    );
  }

  if (
    product.iosVersion
  ) {
    tags.push(
      product.iosVersion
    );
  }

  if (
    product.category
  ) {
    tags.push(
      String(
        product.category
      ).toUpperCase()
    );
  }

  if (
    tags.length === 0
  ) {
    tags.push(
      "BOLO"
    );
  }

  return tags;
}

/* =========================================
   STORE
========================================= */

function Store() {
  const [
    activeCategory,
    setActiveCategory,
  ] = useState("all");

  const [
    dashboardProducts,
    setDashboardProducts,
  ] = useState([]);

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(true);

  /* =========================================
     LOAD ADMIN PRODUCTS
  ========================================= */

  useEffect(() => {
    const productsRef =
      collection(
        db,
        "products"
      );

    const unsubscribe =
      onSnapshot(
        productsRef,

        (snapshot) => {
          const loaded =
            snapshot.docs.map(
              (item) => {
                const data =
                  item.data();

                const title =
                  data.title ||
                  data.name ||
                  "Untitled Product";

                /*
                  If this is Aim Neck,
                  connect it to the
                  existing Aim Neck page.
                */

                const isAimNeck =
                  normalizeTitle(
                    title
                  ).includes(
                    "aim neck"
                  );

                return {imageUrl:
  data.imageUrl || "",

imagePath:
  data.imagePath || "",
                  id:
                    `firestore-${item.id}`,

                  firestoreId:
                    item.id,

                  category:
                    String(
                      data.category ||
                      "premium"
                    ).toLowerCase(),

                  icon:
                    data.icon ||
                    "🎯",

                  title,

                  description:
                    data.description ||
                    "BOLO premium product.",

                  tags:
                    createTags(
                      data
                    ),

                  price:
                    formatPrice(
                      data.price
                    ),

                  type:
                    isAimNeck
                      ? "page"
                      : "paid",

                  link:
                    isAimNeck
                      ? "/store/aim-neck"
                      : "",

                  button:
                    isAimNeck
                      ? "View Product"
                      : "Premium Product",
                };
              }
            );

          setDashboardProducts(
            loaded
          );

          setProductsLoading(
            false
          );
        },

        (error) => {
          console.error(
            "Store product error:",
            error
          );

          setProductsLoading(
            false
          );
        }
      );

    return unsubscribe;
  }, []);

  /* =========================================
     MERGE BUILT-IN + ADMIN PRODUCTS

     If an Admin Product has the same
     title as a built-in product,
     the Admin Product replaces it.
  ========================================= */

const products = [
  ...dashboardProducts,
];


  /* =========================================
     FILTER
  ========================================= */

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
            Explore BOLO products,
            sensitivity tools, HUD
            resources, guides and
            downloads.
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
          STORE
      ===================================== */}

      <section className="store-content">

        {/* FILTER */}

        <div className="store-filter">

          <button
            type="button"
            className={
              activeCategory ===
              "all"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                "all"
              )
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              activeCategory ===
              "free"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                "free"
              )
            }
          >
            Free Tools
          </button>

          <button
            type="button"
            className={
              activeCategory ===
              "premium"
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

          <button
            type="button"
            className={
              activeCategory ===
              "hud"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                "hud"
              )
            }
          >
            HUD
          </button>

          <button
            type="button"
            className={
              activeCategory ===
              "guide"
                ? "filter-active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                "guide"
              )
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

        {/* LOADING */}

        {productsLoading && (
          <div className="profile-loading">
            Loading BOLO products...
          </div>
        )}

        {/* PRODUCTS */}

        <div className="store-products">

          {filteredProducts.map(
            (
              product,
              index
            ) => (

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
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                </div>

               {product.imageUrl && (
  <div className="store-product-image">
    <img
      src={product.imageUrl}
      alt={product.title || "BOLO product"}
    />
  </div>
)} <div className="store-product-info">

                  <h2>
                    {product.title}
                  </h2>

                  {product.price && (
                    <div className="store-product-price">
                      {
                        product.price
                      }
                    </div>
                  )}

                  <p>
                    {
                      product.description
                    }
                  </p>

                </div>

                <div className="store-product-bottom">

                  <div className="store-tags">

                    {product.tags.map(
                      (
                        tag,
                        tagIndex
                      ) => (
                        <span
                          key={
                            `${tag}-${tagIndex}`
                          }
                        >
                          {tag}
                        </span>
                      )
                    )}

                  </div>

                  {/* PAGE */}

                  {product.type ===
                  "page" ? (

                    <Link
                      to={
                        product.link
                      }
                      className="store-action"
                    >
                      {
                        product.button
                      }

                      <span>
                        →
                      </span>
                    </Link>

                  ) : product.type ===
                    "download" ? (

                    /* DOWNLOAD */

                    <a
                      href={
                        product.file
                      }
                      className="store-action"
                      download={
                        !product.file.endsWith(
                          ".mobileconfig"
                        )
                      }
                    >
                      {
                        product.button
                      }

                      <span>
                        ↓
                      </span>
                    </a>

                  ) : (

                    /* ADMIN-CREATED PREMIUM PRODUCT */

                    <button
                      type="button"
                      className="store-action"
                      disabled
                    >
                      {
                        product.button ||
                        "Premium Product"
                      }

                      <span>
                        →
                      </span>
                    </button>

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
            BOLO{" "}
            <span>
              AIM
            </span>
          </h2>

          <p>
            Install the BOLO AIM DNS
            profile on your iPhone for
            a reliable gaming network
            setup.
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
            BOLO AIM changes DNS
            settings. It does not
            modify Free Fire aim or
            game files.
          </small>

        </div>

      </section>

      {/* =====================================
          GENERATOR
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
            Choose your device and
            play style to generate a
            personalized sensitivity
            setup.
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
                BOLO SENSITIVITY
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
            Premium BOLO products
            with protected payment
            and delivery.
          </p>

        </div>

        <div className="premium-list">

          <div>
            <span>
              01
            </span>
            Admin-managed products
          </div>

          <div>
            <span>
              02
            </span>
            Protected purchase
          </div>

          <div>
            <span>
              03
            </span>
            Account purchase history
          </div>

          <div>
            <span>
              04
            </span>
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