import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

/* =========================================
   CREATE RANDOM BOLO ORDER CODE
========================================= */

function createOrderCode() {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "BOLO-";

  for (let i = 0; i < 6; i += 1) {
    code +=
      characters[
        Math.floor(
          Math.random() *
            characters.length
        )
      ];
  }

  return code;
}

function AimNeck() {
  const [user, setUser] =
    useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [showZelle, setShowZelle] =
    useState(false);

  const [copiedZelle, setCopiedZelle] =
    useState(false);

  const [copiedCode, setCopiedCode] =
    useState(false);

  const [orderCode, setOrderCode] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [orderSubmitted, setOrderSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
    IMPORTANT:
    Put your own Zelle recipient here.
    Keep it private outside your website code.
  */

  const zelleRecipient =
    "davecasseus67@gmail.com";

  /* =========================================
     AUTH
  ========================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setAuthReady(true);
        }
      );

    return unsubscribe;
  }, []);

  /* =========================================
     START ZELLE CHECKOUT
  ========================================= */

  const handleStartZelle = () => {
    setError("");
    setOrderSubmitted(false);

    if (!user) {
      setError(
        "Sign in with Google before purchasing."
      );

      return;
    }

    setOrderCode(
      createOrderCode()
    );

    setShowZelle(true);
  };

  /* =========================================
     COPY ZELLE
  ========================================= */

  const handleCopyZelle = async () => {
    try {
      await navigator.clipboard.writeText(
        zelleRecipient
      );

      setCopiedZelle(true);

      setTimeout(() => {
        setCopiedZelle(false);
      }, 2000);
    } catch {
      setError(
        "Could not copy the Zelle recipient."
      );
    }
  };

  /* =========================================
     COPY ORDER CODE
  ========================================= */

  const handleCopyOrderCode =
    async () => {
      try {
        await navigator.clipboard.writeText(
          orderCode
        );

        setCopiedCode(true);

        setTimeout(() => {
          setCopiedCode(false);
        }, 2000);
      } catch {
        setError(
          "Could not copy the order code."
        );
      }
    };

  /* =========================================
     SUBMIT PENDING ORDER
  ========================================= */

  const handleSubmitOrder =
    async () => {
      if (!user) {
        setError(
          "You must be signed in to submit an order."
        );

        return;
      }

      if (!orderCode) {
        setError(
          "Order code is missing. Restart checkout."
        );

        return;
      }

      if (submitting) {
        return;
      }

      setSubmitting(true);
      setError("");

      try {
        await addDoc(
          collection(
            db,
            "orders"
          ),
          {
            buyerId:
              user.uid,

            buyerName:
              user.displayName ||
              "BOLO Customer",

            buyerEmail:
              user.email ||
              "",

            productId:
              "aim-neck-80",

            productName:
              "Aim Neck 80%",

            price:
              20,

            currency:
              "USD",

            paymentMethod:
              "Zelle",

            orderCode,

            status:
              "pending",

            createdAt:
              serverTimestamp(),
          }
        );

        setOrderSubmitted(true);
      } catch (err) {
        console.error(err);

        setError(
          "Could not submit your order. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =========================================
     CANCEL CHECKOUT
  ========================================= */

  const handleCancel = () => {
    setShowZelle(false);
    setOrderCode("");
    setOrderSubmitted(false);
    setError("");
  };

  return (
    <main className="product-page">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="product-hero">

        <Link
          to="/store"
          className="back-link"
        >
          ← Back to Store
        </Link>

        <div className="product-hero-grid">

          {/* PRODUCT */}

          <div className="product-main-info">

            <span className="red-label">
              BOLO PREMIUM
            </span>

            <h1>
              AIM NECK
              <br />

              <span>
                80%.
              </span>
            </h1>

            <p>
              BOLO premium product for
              compatible iPhone devices.
            </p>

            <div className="product-tags">

              <span>
                IPHONE ONLY
              </span>

              <span>
                iOS 17–26.0
              </span>

              <span>
                BOLO
              </span>

            </div>

          </div>

          {/* =================================
              BUY CARD
          ================================= */}

          <div className="product-buy-card">

            <span className="product-price-label">
              PRICE
            </span>

            <strong className="product-page-price">
              $20
            </strong>

            <p>
              One-time purchase.
            </p>

            {!authReady ? (

              <button
                type="button"
                className="product-buy-button"
                disabled
              >
                Loading...
              </button>

            ) : !showZelle ? (

              <button
                type="button"
                className="product-buy-button"
                onClick={
                  handleStartZelle
                }
              >
                Buy with Zelle →
              </button>

            ) : orderSubmitted ? (

              /* =============================
                 ORDER SUBMITTED
              ============================= */

              <div className="order-success">

                <span className="red-label">
                  ORDER RECEIVED
                </span>

                <h3>
                  Payment Verification Pending
                </h3>

                <p>
                  Your BOLO order has been
                  submitted successfully.
                </p>

                <div className="order-success-code">

                  <span>
                    ORDER CODE
                  </span>

                  <strong>
                    {orderCode}
                  </strong>

                </div>

                <p>
                  Keep this code until your
                  order has been reviewed.
                </p>

                <button
                  type="button"
                  className="zelle-cancel-button"
                  onClick={
                    handleCancel
                  }
                >
                  Close
                </button>

              </div>

            ) : (

              /* =============================
                 ZELLE CHECKOUT
              ============================= */

              <div className="zelle-checkout">

                <div className="zelle-checkout-header">

                  <span>
                    PAYMENT METHOD
                  </span>

                  <strong>
                    Zelle
                  </strong>

                </div>

                {/* PRICE */}

                <div className="zelle-price-box">

                  <span>
                    SEND EXACTLY
                  </span>

                  <strong>
                    $20.00
                  </strong>

                </div>

                {/* ZELLE RECIPIENT */}

                <div className="zelle-recipient">

                  <span>
                    SEND PAYMENT TO
                  </span>

                  <div>

                    <strong>
                      {zelleRecipient}
                    </strong>

                    <button
                      type="button"
                      onClick={
                        handleCopyZelle
                      }
                    >
                      {copiedZelle
                        ? "Copied ✓"
                        : "Copy"}
                    </button>

                  </div>

                </div>

                {/* =================================
                    ORDER CODE
                ================================= */}

                <div className="bolo-order-code">

                  <span>
                    YOUR ORDER CODE
                  </span>

                  <strong>
                    {orderCode}
                  </strong>

                  <button
                    type="button"
                    onClick={
                      handleCopyOrderCode
                    }
                  >
                    {copiedCode
                      ? "Copied ✓"
                      : "Copy Order Code"}
                  </button>

                </div>

                {/* STEPS */}

                <div className="zelle-steps">

                  <div>

                    <span>
                      01
                    </span>

                    <p>
                      Open Zelle through your
                      eligible bank or credit
                      union.
                    </p>

                  </div>

                  <div>

                    <span>
                      02
                    </span>

                    <p>
                      Send exactly $20 to the
                      Zelle recipient shown
                      above.
                    </p>

                  </div>

                  <div>

                    <span>
                      03
                    </span>

                    <p>
                      Include your BOLO order
                      code when the payment
                      service provides a memo
                      or message field.
                    </p>

                  </div>

                  <div>

                    <span>
                      04
                    </span>

                    <p>
                      Return here and press
                      Submit Pending Order.
                    </p>

                  </div>

                </div>

                {/* ORDER SUMMARY */}

                <div className="order-summary">

                  <div>
                    <span>
                      PRODUCT
                    </span>

                    <strong>
                      Aim Neck 80%
                    </strong>
                  </div>

                  <div>
                    <span>
                      PAYMENT
                    </span>

                    <strong>
                      Zelle
                    </strong>
                  </div>

                  <div>
                    <span>
                      TOTAL
                    </span>

                    <strong>
                      $20.00
                    </strong>
                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="generator-error">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="button"
                  className="zelle-paid-button"
                  onClick={
                    handleSubmitOrder
                  }
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Submitting..."
                    : "I've Paid — Submit Pending Order"}
                </button>

                {/* CANCEL */}

                <button
                  type="button"
                  className="zelle-cancel-button"
                  onClick={
                    handleCancel
                  }
                >
                  Cancel
                </button>

                <small>
                  Clicking submit does not
                  automatically approve the
                  purchase. Payment must be
                  manually verified before
                  product access is provided.
                </small>

              </div>

            )}

            {/* SIGN-IN ERROR */}

            {!showZelle &&
              error && (
                <div className="generator-error">
                  {error}
                </div>
              )}

          </div>

        </div>

      </section>

      {/* =====================================
          PRODUCT DETAILS
      ===================================== */}

      <section className="product-details-section">

        <div className="product-section-heading">

          <span className="red-label">
            PRODUCT DETAILS
          </span>

          <h2>
            Compatibility
          </h2>

        </div>

        <div className="product-detail-grid">

          <div className="product-detail-card">

            <span>
              DEVICE
            </span>

            <strong>
              iPhone
            </strong>

            <p>
              This product is intended for
              supported iPhone devices.
            </p>

          </div>

          <div className="product-detail-card">

            <span>
              iOS VERSION
            </span>

            <strong>
              17–26.0
            </strong>

            <p>
              Check your iPhone software
              version before purchasing.
            </p>

          </div>

          <div className="product-detail-card">

            <span>
              PRICE
            </span>

            <strong>
              $20
            </strong>

            <p>
              One-time purchase.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================
          BEFORE BUYING
      ===================================== */}

      <section className="product-warning-section">

        <span className="red-label">
          BEFORE YOU BUY
        </span>

        <h2>
          Check your device first.
        </h2>

        <p>
          Make sure you are using an iPhone
          running a compatible iOS version
          before completing your purchase.
        </p>

      </section>

    </main>
  );
}

export default AimNeck;