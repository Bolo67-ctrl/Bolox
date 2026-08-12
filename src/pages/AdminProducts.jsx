import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "../firebase";

/*
  Use the SAME Firebase UID
  from your AdminDashboard.jsx
*/
const ADMIN_UID =
  "YtzsZiecGMVXD5I4PEDVYj1c0uf1";

function AdminProducts() {
  const [user, setUser] =
    useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================
     PRODUCT FORM
  ========================================= */

  const [title, setTitle] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [device, setDevice] =
    useState("iPhone");

  const [
    compatibility,
    setCompatibility,
  ] = useState("");

  const [category, setCategory] =
    useState("premium");

  /* =========================================
     PRODUCT IMAGE
  ========================================= */

  const [
    productImage,
    setProductImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

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
     CLEAN IMAGE PREVIEW
  ========================================= */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  /* =========================================
     LOAD PRODUCTS
  ========================================= */

  useEffect(() => {
    if (!isAdmin) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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
          const loaded =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setProducts(
            loaded
          );

          setLoading(false);
        },

        (err) => {
          console.error(
            err
          );

          setError(
            "Could not load products."
          );

          setLoading(false);
        }
      );

    return unsubscribe;
  }, [isAdmin]);

  /* =========================================
     IMAGE SELECT
  ========================================= */

  const handleImageSelect =
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        setProductImage(
          null
        );

        setImagePreview(
          ""
        );

        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Choose an image file."
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        4 * 1024 * 1024
      ) {
        setError(
          "Choose an image smaller than 4 MB."
        );

        event.target.value =
          "";

        return;
      }

      setError("");
      setMessage("");

      setProductImage(
        file
      );

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setImagePreview(
        URL.createObjectURL(
          file
        )
      );
    };

  /* =========================================
     UPLOAD PRODUCT IMAGE
  ========================================= */

  const uploadProductImage =
    async () => {
      if (!productImage) {
        return {
          imageUrl: "",
          imagePath: "",
        };
      }

      const idToken =
        await user.getIdToken(
          true
        );

      const formData =
        new FormData();

      formData.append(
        "file",
        productImage
      );

      const response =
        await fetch(
          "/api/upload-product-image",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${idToken}`,
            },

            body:
              formData,
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
            `Image upload failed (${response.status}).`
        );
      }

      return {
        imageUrl:
          result.imageUrl ||
          "",

        imagePath:
          result.path ||
          "",
      };
    };

  /* =========================================
     CREATE PRODUCT
  ========================================= */

  const handleCreateProduct =
    async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        setError(
          "Admin access required."
        );

        return;
      }

      if (
        !title.trim() ||
        !price
      ) {
        setError(
          "Enter a product name and price."
        );

        return;
      }

      const numericPrice =
        Number(
          price
        );

      if (
        Number.isNaN(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        setError(
          "Enter a valid price."
        );

        return;
      }

      setSaving(
        true
      );

      setError(
        ""
      );

      setMessage(
        ""
      );

      try {
        /* -------------------------------------
           UPLOAD IMAGE FIRST
        ------------------------------------- */

        const {
          imageUrl,
          imagePath,
        } =
          await uploadProductImage();

        /* -------------------------------------
           SAVE PRODUCT
        ------------------------------------- */

        await addDoc(
          collection(
            db,
            "products"
          ),
          {
            title:
              title.trim(),

            price:
              numericPrice,

            description:
              description.trim(),

            device:
              device.trim(),

            compatibility:
              compatibility.trim(),

            category,

            imageUrl,

            imagePath,

            active:
              true,

            createdBy:
              user.uid,

            createdAt:
              serverTimestamp(),
          }
        );

        /* -------------------------------------
           RESET FORM
        ------------------------------------- */

        setTitle(
          ""
        );

        setPrice(
          ""
        );

        setDescription(
          ""
        );

        setDevice(
          "iPhone"
        );

        setCompatibility(
          ""
        );

        setCategory(
          "premium"
        );

        setProductImage(
          null
        );

        if (imagePreview) {
          URL.revokeObjectURL(
            imagePreview
          );
        }

        setImagePreview(
          ""
        );

        const imageInput =
          document.getElementById(
            "admin-product-image"
          );

        if (imageInput) {
          imageInput.value =
            "";
        }

        setMessage(
          "Product created successfully."
        );
      } catch (err) {
        console.error(
          err
        );

        setError(
          err.message ||
            "Could not create product."
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* =========================================
     DELETE PRODUCT
  ========================================= */

  const handleDeleteProduct =
    async (productId) => {
      if (!isAdmin) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this product?"
        );

      if (!confirmed) {
        return;
      }

      setError(
        ""
      );

      setMessage(
        ""
      );

      try {
        await deleteDoc(
          doc(
            db,
            "products",
            productId
          )
        );

        setMessage(
          "Product deleted."
        );
      } catch (err) {
        console.error(
          err
        );

        setError(
          "Could not delete product."
        );
      }
    };

  /* =========================================
     LOADING AUTH
  ========================================= */

  if (!authReady) {
    return (
      <main className="admin-products-page">

        <div className="profile-loading">
          Loading product manager...
        </div>

      </main>
    );
  }

  /* =========================================
     ACCESS DENIED
  ========================================= */

  if (!isAdmin) {
    return (
      <main className="admin-products-page">

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
            can manage products.
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
    <main className="admin-products-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="admin-products-header">

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
            PRODUCTS.
          </span>
        </h1>

        <p>
          Create and manage BOLO products,
          prices and product images without
          editing the Store code.
        </p>

      </section>

      {/* =====================================
          CONTENT
      ===================================== */}

      <section className="admin-products-content">

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

        <div className="admin-products-layout">

          {/* =================================
              CREATE PRODUCT
          ================================= */}

          <form
            className="admin-product-form"
            onSubmit={
              handleCreateProduct
            }
          >

            <div className="admin-product-form-heading">

              <span className="red-label">
                NEW PRODUCT
              </span>

              <h2>
                Add Product
              </h2>

            </div>

            {/* NAME */}

            <label>
              Product Name

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Aim Neck 80%"
              />
            </label>

            {/* PRICE */}

            <label>
              Price

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value
                  )
                }
                placeholder="20"
              />
            </label>

            {/* DESCRIPTION */}

            <label>
              Description

              <textarea
                value={
                  description
                }
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe the product..."
                rows="5"
              />
            </label>

            {/* DEVICE */}

            <label>
              Device

              <input
                type="text"
                value={device}
                onChange={(event) =>
                  setDevice(
                    event.target.value
                  )
                }
                placeholder="iPhone"
              />
            </label>

            {/* COMPATIBILITY */}

            <label>
              Compatibility

              <input
                type="text"
                value={
                  compatibility
                }
                onChange={(event) =>
                  setCompatibility(
                    event.target.value
                  )
                }
                placeholder="iOS 17–26.0"
              />
            </label>

            {/* CATEGORY */}

            <label>
              Category

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <option value="premium">
                  Premium
                </option>

                <option value="free">
                  Free
                </option>

                <option value="hud">
                  HUD
                </option>

                <option value="guide">
                  Guide
                </option>

                <option value="optimization">
                  Optimization
                </option>
              </select>
            </label>

            {/* =================================
                PRODUCT IMAGE
            ================================= */}

            <label>
              Product Image

              <input
                id="admin-product-image"
                type="file"
                accept="image/*"
                onChange={
                  handleImageSelect
                }
              />
            </label>

            {productImage && (
              <div className="admin-product-image-selected">

                <strong>
                  {productImage.name}
                </strong>

                <small>
                  {(
                    productImage.size /
                    1024 /
                    1024
                  ).toFixed(2)}
                  {" MB"}
                </small>

              </div>
            )}

            {imagePreview && (
              <div className="admin-product-image-preview">

                <img
                  src={
                    imagePreview
                  }
                  alt="Product preview"
                />

              </div>
            )}

            <button
              type="submit"
              className="admin-product-save"
              disabled={saving}
            >
              {saving
                ? "Creating..."
                : "Create Product →"}
            </button>

          </form>

          {/* =================================
              PRODUCT LIST
          ================================= */}

          <div className="admin-product-list">

            <div className="admin-product-list-heading">

              <div>

                <span className="red-label">
                  CATALOG
                </span>

                <h2>
                  Your Products
                </h2>

              </div>

              <strong>
                {products.length}
              </strong>

            </div>

            {loading ? (

              <div className="profile-loading">
                Loading products...
              </div>

            ) : products.length ===
              0 ? (

              <div className="saved-empty">

                <h3>
                  No dashboard products yet.
                </h3>

                <p>
                  Create your first product
                  using the form.
                </p>

              </div>

            ) : (

              <div className="admin-product-cards">

                {products.map(
                  (product) => (

                    <article
                      className="admin-product-card"
                      key={
                        product.id
                      }
                    >

                      {/* IMAGE */}

                      {product.imageUrl && (
                        <div className="admin-product-card-image">

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
                      )}

                      <div className="admin-product-card-top">

                        <div>

                          <span>
                            {String(
                              product.category ||
                                "product"
                            ).toUpperCase()}
                          </span>

                          <h3>
                            {
                              product.title
                            }
                          </h3>

                        </div>

                        <strong>
                          $
                          {Number(
                            product.price ||
                              0
                          ).toFixed(2)}
                        </strong>

                      </div>

                      <p>
                        {product.description ||
                          "No description."}
                      </p>

                      <div className="admin-product-meta">

                        <span>
                          {product.device ||
                            "All devices"}
                        </span>

                        {product.compatibility && (
                          <span>
                            {
                              product.compatibility
                            }
                          </span>
                        )}

                      </div>

                      <button
                        type="button"
                        className="admin-product-delete"
                        onClick={() =>
                          handleDeleteProduct(
                            product.id
                          )
                        }
                      >
                        Delete Product
                      </button>

                    </article>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}

export default AdminProducts;