import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

const ADMIN_UID =
  "YtzsZiecGMVXD5I4PEDVYj1c0uf1";

function AdminFiles() {
  const [user, setUser] =
    useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [uploading, setUploading] =
    useState(false);

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

  const isAdmin =
    user?.uid === ADMIN_UID;

  /* =========================================
     LOAD PRODUCTS
  ========================================= */

  useEffect(() => {
    if (!isAdmin) {
      setProducts([]);
      return;
    }

    const productsQuery =
      query(
        collection(
          db,
          "products"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

    const unsubscribe =
      onSnapshot(
        productsQuery,

        (snapshot) => {
          const loadedProducts =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setProducts(
            loadedProducts
          );
        },

        (err) => {
          console.error(
            "Product load error:",
            err
          );

          setError(
            "Could not load products."
          );
        }
      );

    return unsubscribe;
  }, [isAdmin]);

  /* =========================================
     FILE SELECT
  ========================================= */

  const handleFileSelect =
    (event) => {
      const file =
        event.target.files?.[0];

      setSelectedFile(
        file || null
      );

      setMessage("");
      setError("");
    };

  /* =========================================
     SECURE FILE UPLOAD
  ========================================= */

  const handleUpload =
    async () => {
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

      /*
        Keep this below the current
        backend upload limit.
      */

      if (
        selectedFile.size >
        4 * 1024 * 1024
      ) {
        setError(
          "For now, choose a file smaller than 4 MB."
        );

        return;
      }

      setUploading(true);

      setMessage("");
      setError("");

      try {
        /* -------------------------------------
           GET FIREBASE LOGIN TOKEN
        ------------------------------------- */

        const idToken =
          await user.getIdToken(
            true
          );

        /* -------------------------------------
           BUILD FORM DATA
        ------------------------------------- */

        const formData =
          new FormData();

        formData.append(
          "productId",
          selectedProduct
        );

        formData.append(
          "file",
          selectedFile
        );

        /* -------------------------------------
           SEND TO VERCEL BACKEND
        ------------------------------------- */

        const response =
          await fetch(
            "/api/upload-file",
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${idToken}`,
              },

              body: formData,
            }
          );

        let result = {};

        try {
          result =
            await response.json();
        } catch {
          result = {};
        }

        if (!response.ok) {
          throw new Error(
            result.error ||
              `Upload failed (${response.status}).`
          );
        }

        /* -------------------------------------
           SUCCESS
        ------------------------------------- */

        setMessage(
          "Private file uploaded successfully."
        );

        setSelectedFile(
          null
        );

        /*
          Reset the file input visually.
        */

        const input =
          document.getElementById(
            "admin-product-file"
          );

        if (input) {
          input.value = "";
        }
      } catch (err) {
        console.error(
          "Upload error:",
          err
        );

        setError(
          err.message ||
            "Could not upload file."
        );
      } finally {
        setUploading(false);
      }
    };

  /* =========================================
     LOADING
  ========================================= */

  if (!authReady) {
    return (
      <main className="admin-files-page">

        <div className="profile-loading">
          Loading file manager...
        </div>

      </main>
    );
  }

  /* =========================================
     ACCESS DENIED
  ========================================= */

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

            <span>
              DENIED.
            </span>
          </h1>

          <p>
            Only the BOLO administrator
            can manage private product
            files.
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

      {/* =====================================
          HEADER
      ===================================== */}

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

          <span>
            FILES.
          </span>
        </h1>

        <p>
          Upload private files and
          connect them to BOLO products.
        </p>

      </section>

      {/* =====================================
          CONTENT
      ===================================== */}

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

          {/* PRODUCT */}

          <label>
            Product

            <select
              value={
                selectedProduct
              }
              onChange={(event) => {
                setSelectedProduct(
                  event.target.value
                );

                setMessage("");
                setError("");
              }}
            >

              <option value="">
                Select Product
              </option>

              {products.map(
                (product) => (
                  <option
                    key={
                      product.id
                    }
                    value={
                      product.id
                    }
                  >
                    {product.title ||
                      "Untitled Product"}
                  </option>
                )
              )}

            </select>
          </label>

          {/* FILE */}

          <label>
            Product File

            <input
              id="admin-product-file"
              type="file"
              onChange={
                handleFileSelect
              }
            />
          </label>

          {/* SELECTED FILE */}

          {selectedFile && (
            <div className="admin-file-selected">

              <strong>
                {
                  selectedFile.name
                }
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

          {/* UPLOAD */}

          <button
            type="button"
            className="admin-file-upload-btn"
            onClick={
              handleUpload
            }
            disabled={
              uploading ||
              !selectedProduct ||
              !selectedFile
            }
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