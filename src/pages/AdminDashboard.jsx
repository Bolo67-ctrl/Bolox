import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase";

/*
  IMPORTANT:
  Replace this with the SAME Firebase UID
  you used in your Firestore isAdmin() rule.
*/
const ADMIN_UID = "YtzsZiecGMVXD5I4PEDVYj1c0uf1";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
      }
    );

    return unsubscribe;
  }, []);

  /* LOADING */

  if (!authReady) {
    return (
      <main className="admin-dashboard-page">
        <div className="profile-loading">
          Loading admin dashboard...
        </div>
      </main>
    );
  }

  /* BLOCK EVERYONE EXCEPT ADMIN */

  if (!user || user.uid !== ADMIN_UID) {
    return (
      <main className="admin-dashboard-page">

        <section className="admin-access-denied">
          <span className="red-label">
            BOLO ADMIN
          </span>

          <h1>
            ACCESS
            <br />
            <span>DENIED.</span>
          </h1>

          <p>
            This area is restricted to the
            BOLO administrator.
          </p>

          <Link
            to="/"
            className="primary-btn"
          >
            ← Back Home
          </Link>
        </section>

      </main>
    );
  }

  /* ADMIN DASHBOARD */

  return (
    <main className="admin-dashboard-page">

      <section className="admin-dashboard-hero">

        <span className="red-label">
          BOLO ADMIN
        </span>

        <h1>
          ADMIN
          <br />
          <span>DASHBOARD.</span>
        </h1>

        <p>
          Manage BOLO products, customer
          orders and product delivery from
          one place.
        </p>

      </section>

      <section className="admin-dashboard-content">

        <div className="admin-dashboard-grid">

          {/* ORDERS */}

          <Link
            to="/admin/orders"
            className="admin-dashboard-card"
          >
            <div className="admin-dashboard-icon">
              📦
            </div>

            <span>ORDERS</span>

            <h2>
              Manage Orders
            </h2>

            <p>
              Review pending purchases and
              approve or reject customer
              payments.
            </p>

            <strong>
              Open Orders →
            </strong>
          </Link>

          {/* PRODUCTS */}

          <div className="admin-dashboard-card">

            <div className="admin-dashboard-icon">
              🎯
            </div>

            <span>PRODUCTS</span>

            <h2>
              Manage Products
            </h2>

            <p>
              Create BOLO products, set
              prices and manage product
              information.
            </p>

            <strong>
              Coming next →
            </strong>
          </div>

          {/* FILES */}

          <div className="admin-dashboard-card">

            <div className="admin-dashboard-icon">
              📁
            </div>

            <span>PRODUCT FILES</span>

            <h2>
              Manage Files
            </h2>

            <p>
              Attach private files to your
              paid BOLO products.
            </p>

            <strong>
              Coming next →
            </strong>
          </div>

          {/* CUSTOMERS */}

          <div className="admin-dashboard-card">

            <div className="admin-dashboard-icon">
              👤
            </div>

            <span>CUSTOMERS</span>

            <h2>
              Customer Access
            </h2>

            <p>
              See which customers have
              approved access to BOLO
              products.
            </p>

            <strong>
              Coming next →
            </strong>
          </div>

        </div>

      </section>

    </main>
  );
}

export default AdminDashboard;