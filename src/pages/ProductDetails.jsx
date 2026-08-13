import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "../firebase";

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

  return price.startsWith("$")
    ? price
    : `$${price}`;
}

function ProductDetails() {
  const { productId } =
    useParams();

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!productId) {
      setError(
        "Product not found."
      );

      setLoading(false);
      return;
    }

    const productRef =
      doc(
        db,
        "products",
        productId
      );

    const unsubscribe =
      onSnapshot(
        productRef,

        (snapshot) => {
          if (!snapshot.exists()) {
            setProduct(null);

            setError(
              "Product not found."
            );

            setLoading(false);
            return;
          }

          setProduct({
            id: snapshot.id,
            ...snapshot.data(),
          });

          setError("");
          setLoading(false);
        },

        (err) => {
          console.error(
            "Product details error:",
            err
          );

          setError(
            "Could not load this product."
          );

          setLoading(false);
        }
      );

    return unsubscribe;
  }, [productId]);

  if (loading) {
    return (
      <main className="dynamic-product-page">
        <div className="profile-loading">
          Loading product...
        </div>
      </main>
    );
  }

  if (
    error ||
    !product
  ) {
    return (
      <main className="dynamic-product-page">

        <section className="dynamic-product-empty">

          <span className="red-label">
            BOLO STORE
          </span>

          <h1>
            PRODUCT
            <br />
            <span>
              NOT FOUND.
            </span>
          </h1>

          <p>
            {error ||
              "This product is unavailable."}
          </p>

          <Link
            to="/store"
            className="primary-btn"
          >
            ← Back to Store
          </Link>

        </section>

      </main>
    );
  }

  const price =
    formatPrice(
      product.price
    );

  return (
    <main className="dynamic-product-page">

      <section className="dynamic-product-hero">

        <Link
          to="/store"
          className="back-link"
        >
          ← Back to Store
        </Link>

        <div className="dynamic-product-grid">

          <div className="dynamic-product-image-area">

            {product.imageUrl ? (
              <div className="dynamic-product-image">

                <img
                  src={
                    product.imageUrl
                  }
                  alt={
                    product.title ||
                    "BOLO product"
                  }
                />

              </div>
            ) : (
              <div className="dynamic-product-image-placeholder">

                <span>
                  🎯
                </span>

                <strong>
                  BOLO PRODUCT
                </strong>

              </div>
            )}

          </div>

          <div className="dynamic-product-info">

            <span className="red-label">
              {String(
                product.category ||
                  "premium"
              ).toUpperCase()}
            </span>

            <h1>
              {product.title ||
                "BOLO Product"}
            </h1>

            {price && (
              <strong className="dynamic-product-price">
                {price}
              </strong>
            )}

            <p>
              {product.description ||
                "BOLO premium product."}
            </p>

            <div className="dynamic-product-tags">

              {product.device && (
                <span>
                  {String(
                    product.device
                  ).toUpperCase()}
                </span>
              )}

              {product.compatibility && (
                <span>
                  {
                    product.compatibility
                  }
                </span>
              )}

              <span>
                {String(
                  product.category ||
                    "BOLO"
                ).toUpperCase()}
              </span>

            </div>

            <div className="dynamic-product-buy">

              <div>

                <span>
                  PRICE
                </span>

                <strong>
                  {price || "$0"}
                </strong>

              </div>

              <button
                type="button"
                className="dynamic-product-buy-btn"
              >
                Buy Product →
              </button>

              <small>
                Secure purchase and
                protected product delivery.
              </small>

            </div>

          </div>

        </div>

      </section>

      <section className="dynamic-product-details">

        <span className="red-label">
          PRODUCT DETAILS
        </span>

        <h2>
          Product Information
        </h2>

        <div className="dynamic-product-detail-grid">

          <div>
            <span>
              DEVICE
            </span>

            <strong>
              {product.device ||
                "Not specified"}
            </strong>
          </div>

          <div>
            <span>
              COMPATIBILITY
            </span>

            <strong>
              {product.compatibility ||
                "Not specified"}
            </strong>
          </div>

          <div>
            <span>
              CATEGORY
            </span>

            <strong>
              {String(
                product.category ||
                  "product"
              ).toUpperCase()}
            </strong>
          </div>

        </div>

      </section>

    </main>
  );
}

export default ProductDetails;
