import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase";

function AdminOrders() {
  const [user, setUser] =
    useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [loadingOrders, setLoadingOrders] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  const [message, setMessage] =
    useState("");

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
     LIVE ORDERS
  ========================================= */

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const ordersQuery = query(
      collection(
        db,
        "orders"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(
        ordersQuery,
        (snapshot) => {
          const loaded =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setOrders(loaded);
          setLoadingOrders(false);
        },
        (err) => {
          console.error(err);

          setError(
            "Could not load orders. Make sure you are signed into the BOLO admin account."
          );

          setLoadingOrders(false);
        }
      );

    return unsubscribe;
  }, [user]);

  /* =========================================
     UPDATE ORDER
  ========================================= */

  const updateOrderStatus =
    async (
      orderId,
      newStatus
    ) => {
      if (!user) {
        return;
      }

      if (updatingId) {
        return;
      }

      setUpdatingId(orderId);
      setMessage("");
      setError("");

      try {
        const orderRef = doc(
          db,
          "orders",
          orderId
        );

        await updateDoc(
          orderRef,
          {
            status:
              newStatus,

            reviewedAt:
              serverTimestamp(),

            reviewedBy:
              user.uid,
          }
        );

        setMessage(
          newStatus === "approved"
            ? "Order approved."
            : "Order rejected."
        );
      } catch (err) {
        console.error(err);

        setError(
          "Could not update this order. Check your admin Firestore rules."
        );
      } finally {
        setUpdatingId("");
      }
    };

  /* =========================================
     LOADING
  ========================================= */

  if (!authReady) {
    return (
      <main className="admin-orders-page">

        <div className="profile-loading">
          Loading admin...
        </div>

      </main>
    );
  }

  /* =========================================
     NOT SIGNED IN
  ========================================= */

  if (!user) {
    return (
      <main className="admin-orders-page">

        <section className="admin-orders-empty">

          <span className="red-label">
            BOLO ADMIN
          </span>

          <h1>
            SIGN IN
            <br />
            <span>
              REQUIRED.
            </span>
          </h1>

          <p>
            Sign in with the BOLO admin
            account to manage orders.
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

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    );

  const completedOrders =
    orders.filter(
      (order) =>
        order.status !==
        "pending"
    );

  return (
    <main className="admin-orders-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-orders-header">

        <Link
          to="/store"
          className="back-link"
        >
          ← Back to Store
        </Link>

        <span className="red-label">
          BOLO ADMIN
        </span>

        <h1>
          ORDER
          <br />

          <span>
            MANAGER.
          </span>
        </h1>

        <p>
          Review Zelle payments before
          approving product access.
        </p>

      </section>

      {/* =====================================
          STATUS MESSAGES
      ===================================== */}

      {message && (
        <div className="admin-orders-message">

          <div className="profile-success">
            {message}
          </div>

        </div>
      )}

      {error && (
        <div className="admin-orders-message">

          <div className="generator-error">
            {error}
          </div>

        </div>
      )}

      {/* =====================================
          PENDING ORDERS
      ===================================== */}

      <section className="admin-orders-content">

        <div className="admin-orders-title">

          <div>

            <span className="red-label">
              NEEDS REVIEW
            </span>

            <h2>
              Pending Orders
            </h2>

          </div>

          <strong>
            {pendingOrders.length}
          </strong>

        </div>

        {loadingOrders ? (

          <div className="profile-loading">
            Loading orders...
          </div>

        ) : pendingOrders.length === 0 ? (

          <div className="saved-empty">

            <h3>
              No pending orders.
            </h3>

            <p>
              New BOLO purchases will
              appear here.
            </p>

          </div>

        ) : (

          <div className="admin-orders-grid">

            {pendingOrders.map(
              (order) => (

                <article
                  className="admin-order-card"
                  key={order.id}
                >

                  <div className="admin-order-top">

                    <div>

                      <span>
                        ORDER CODE
                      </span>

                      <h3>
                        {order.orderCode ||
                          "No Code"}
                      </h3>

                    </div>

                    <span className="admin-order-status pending">
                      PENDING
                    </span>

                  </div>

                  <div className="admin-order-details">

                    <div>

                      <span>
                        PRODUCT
                      </span>

                      <strong>
                        {order.productName ||
                          "Unknown"}
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

                    <div>

                      <span>
                        PAYMENT
                      </span>

                      <strong>
                        {order.paymentMethod ||
                          "Unknown"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        CUSTOMER
                      </span>

                      <strong>
                        {order.buyerName ||
                          "BOLO Customer"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        EMAIL
                      </span>

                      <strong>
                        {order.buyerEmail ||
                          "No email"}
                      </strong>

                    </div>

                  </div>

                  <div className="admin-order-actions">

                    <button
                      type="button"
                      className="admin-approve-btn"
                      disabled={
                        updatingId ===
                        order.id
                      }
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "approved"
                        )
                      }
                    >
                      {updatingId ===
                      order.id
                        ? "Updating..."
                        : "Approve ✓"}
                    </button>

                    <button
                      type="button"
                      className="admin-reject-btn"
                      disabled={
                        updatingId ===
                        order.id
                      }
                      onClick={() =>
                        updateOrderStatus(
                          order.id,
                          "rejected"
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================
          ORDER HISTORY
      ===================================== */}

      <section className="admin-orders-content admin-order-history">

        <div className="admin-orders-title">

          <div>

            <span className="red-label">
              HISTORY
            </span>

            <h2>
              Reviewed Orders
            </h2>

          </div>

          <strong>
            {completedOrders.length}
          </strong>

        </div>

        {completedOrders.length === 0 ? (

          <div className="saved-empty">

            <h3>
              No reviewed orders yet.
            </h3>

          </div>

        ) : (

          <div className="admin-orders-grid">

            {completedOrders.map(
              (order) => (

                <article
                  className="admin-order-card"
                  key={order.id}
                >

                  <div className="admin-order-top">

                    <div>

                      <span>
                        ORDER CODE
                      </span>

                      <h3>
                        {order.orderCode ||
                          "No Code"}
                      </h3>

                    </div>

                    <span
                      className={
                        order.status ===
                        "approved"
                          ? "admin-order-status approved"
                          : "admin-order-status rejected"
                      }
                    >
                      {String(
                        order.status
                      ).toUpperCase()}
                    </span>

                  </div>

                  <div className="admin-order-details">

                    <div>
                      <span>
                        PRODUCT
                      </span>

                      <strong>
                        {order.productName}
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

                    <div>
                      <span>
                        CUSTOMER
                      </span>

                      <strong>
                        {order.buyerName ||
                          "BOLO Customer"}
                      </strong>
                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminOrders;