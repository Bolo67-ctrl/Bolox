import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { supabase } from "../supabase";

const ADMIN_UID =
  "YtzsZiecGMVXD5I4PEDVYj1c0uf1";

function AdminFiles() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

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

  const isAdmin =
    user?.uid === ADMIN_UID;

  useEffect(() => {
    if (!isAdmin) {
      setProducts([]);
      return;
    }

    const productsQuery = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe =
      onSnapshot(
        productsQuery,
        (snapshot) => {
          const loadedProducts =
            snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            }));

          setProducts(loadedProducts);
        },
        (err) => {
          console.error(err);

          setError(
            "Could not load products."
          );
        }
      );

    return unsubscribe;
  }, [isAdmin]);

  const handleFileSelect = (event) => {
    const file =
      event.target.files?.[0];

    setSelectedFile(
      file || null
    );

    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!isAdmin) {
      setError(
        "Admin access required."
      );

      return;
    }

    if (!selectedProduct) {
      setError(
        "Choose a product first."
      );

      return;
    }

    if (!selectedFile) {
      setError(
        "Choose a file first."
      );

      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const safeFileName =
        selectedFile.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

      const filePath =
        `${selectedProduct}/${Date.now()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("product-files")
        .upload(
          filePath,
          selectedFile,
          {
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      setMessage(
        "File uploaded successfully."
      );

      setSelectedFile(null);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Could not upload file."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!authReady) {
    return (
      <main className="admin-files-page">
        <div className="profile-loading">
          Loading file manager...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-files-page">

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
            Only the BOLO administrator can
            manage private product files.
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

  return (
    <main className="admin-files-page">

      <section className="admin-files-header">

        <Link
          to="/admin"
          className="back-link"
        >
          ← Admin Dashboard
        </Link>

        <span className="red-label">
          BOLO ADMIN
        </span>

        <h1>
          MANAGE
          <br />
          <span>FILES.</span>
        </h1>

        <p>
          Upload private files for your
          BOLO products.
        </p>

      </section>

      <section className="admin-files-content">

        {message && (
          <div className="profile-success">
            {message}
          </div>
        )}

        {error && (
          <div className="generator-error">
            {error}
          </div>
        )}

        <div className="admin-files-card">

          <label>
            Product

            <select
              value={selectedProduct}
              onChange={(event) =>
                setSelectedProduct(
                  event.target.value
                )
              }
            >
              <option value="">
                Select Product
              </option>

              {products.map(
                (product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.title}
                  </option>
                )
              )}

            </select>
          </label>

          <label>
            Product File

            <input
              type="file"
              onChange={
                handleFileSelect
              }
            />
          </label>

          {selectedFile && (
            <div className="admin-file-selected">

              <strong>
                {selectedFile.name}
              </strong>

              <small>
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}
                {" MB"}
              </small>

            </div>
          )}

          <button
            type="button"
            onClick={
              handleUpload
            }
            disabled={
              uploading
            }
            className="admin-file-upload-btn"
          >
            {uploading
              ? "Uploading..."
              : "Upload Private File →"}
          </button>

        </div>

      </section>

    </main>
  );
}

export default AdminFiles;