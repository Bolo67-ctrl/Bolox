import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase";

function MyPurchases() {
  const [user, setUser] =
    useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
     LOAD CUSTOMER ORDERS
  ========================================= */

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersQuery = query(
      collection(
        db,
        "orders"
      ),
      where(
        "buyerId",
        "==",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        ordersQuery,
        (snapshot) => {
          const loaded =
            snapshot.docs
              .map((item) => ({
                id: item.id,
                ...item.data(),
              }))
              .sort((a, b) => {
                const aTime =
                  a.createdAt?.seconds || 0;

                const bTime =
                  b.createdAt?.seconds || 0;

                return bTime - aTime;
              });

          setOrders(loaded);
          setLoading(false);
        },
        (err) => {
          console.error(err);

          setError(
            "Could not load your BOLO purchases."
          );

          setLoading(false);
        }
      );

    return unsubscribe;
  }, [user]);

  /* =========================================
     AUTH LOADING
  ========================================= */

  if (!authReady) {
    return (
      <main className="purchases-page">

        <div className="profile-loading">
          Loading purchases...
        </div>

      </main>
    );
  }

  /* =========================================
     SIGNED OUT
  ========================================= */

  if (!user) {
    return (
      <main className="purchases-page">

        <section className="purchases-login">

          <span className="red-label">
            BOLO PURCHASES
          </span>

          <h1>
            SIGN IN
            <br />

            <span>
              REQUIRED.
            </span>
          </h1>

          <p>
            Sign in with the same Google
            account you used when purchasing
            your BOLO product.
          </p>

          <Link
            to="/"
            className="profile-action"
          >
            ← Back Home
          </Link>

        </section>

      </main>
    );
  }

  return (
    <main className="purchases-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="purchases-header">

        <h1>
          MY
          <br />

          <span>
            PURCHASES.
          </span>
        </h1>

        <p>
          View your BOLO orders and check
          whether product access has been
          approved.
        </p>

      </section>

      {/* =====================================
          CONTENT
      ===================================== */}

      <section className="purchases-content">

        {error && (
          <div className="generator-error">
            {error}
          </div>
        )}

        {loading ? (

          <div className="profile-loading">
            Loading orders...
          </div>

        ) : orders.length === 0 ? (

          <div className="saved-empty">

            <h3>
              No purchases yet.
            </h3>

            <p>
              Products you purchase from
              BOLO will appear here.
            </p>

            <Link
              to="/store"
              className="profile-action"
            >
              Browse Store →
            </Link>

          </div>

        ) : (

          <div className="purchase-grid">

            {orders.map(
              (order) => {

                const status =
                  order.status ||
                  "pending";

                return (
                  <article
                    className="purchase-card"
                    key={order.id}
                  >

                    {/* TOP */}

                    <div className="purchase-card-top">

                      <div>

                        <span>
                          PRODUCT
                        </span>

                        <h2>
                          {order.productName ||
                            "BOLO Product"}
                        </h2>

                      </div>

                      <span
                        className={
                          status ===
                          "approved"
                            ? "purchase-status approved"
                            : status ===
                                "rejected"
                              ? "purchase-status rejected"
                              : "purchase-status pending"
                        }
                      >
                        {status.toUpperCase()}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="purchase-details">

                      <div>

                        <span>
                          ORDER CODE
                        </span>

                        <strong>
                          {order.orderCode ||
                            "—"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          PAYMENT
                        </span>

                        <strong>
                          {order.paymentMethod ||
                            "—"}
                        </strong>

                      </div>

                      <div>

                        <span>
                          TOTAL
                        </span>

                        <strong>
                          $
                          {Number(
                            order.price || 0
                          ).toFixed(2)}
                        </strong>

                      </div>

                    </div>

                    {/* =================================
                        APPROVED
                    ================================= */}

                    {status ===
                    "approved" && (

                      <div className="purchase-access approved">

                        <span>
                          ACCESS GRANTED
                        </span>

                        <h3>
                          Your purchase has been
                          approved.
                        </h3>

                        <p>
                          BOLO verified your
                          payment successfully.
                        </p>

                        {order.productId ===
                        "aim-neck-80" && (

                          <Link
                            to="/store/aim-neck"
                            className="purchase-access-btn"
                          >
                            Open Aim Neck 80% →
                          </Link>

                        )}

                        <small>
                          Secure product delivery
                          will be connected next.
                        </small>

                      </div>

                    )}

                    {/* =================================
                        PENDING
                    ================================= */}

                    {status ===
                    "pending" && (

                      <div className="purchase-access pending">

                        <span>
                          PAYMENT REVIEW
                        </span>

                        <h3>
                          Verification pending.
                        </h3>

                        <p>
                          Your order was received.
                          BOLO is waiting for the
                          payment to be manually
                          verified.
                        </p>

                        <small>
                          Keep your order code until
                          the order has been reviewed.
                        </small>

                      </div>

                    )}

                    {/* =================================
                        REJECTED
                    ================================= */}

                    {status ===
                    "rejected" && (

                      <div className="purchase-access rejected">

                        <span>
                          ORDER NOT APPROVED
                        </span>

                        <h3>
                          Payment could not be
                          verified.
                        </h3>

                        <p>
                          This order was not
                          approved.
                        </p>

                        <Link
                          to="/store/aim-neck"
                          className="purchase-access-btn secondary"
                        >
                          Return to Product →
                        </Link>

                      </div>

                    )}

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default MyPurchases;