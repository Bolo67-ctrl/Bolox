import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

/* =========================================
   IMAGE COMPRESSION
========================================= */

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas =
          document.createElement("canvas");

        const maxSize = 320;

        let width = img.width;
        let height = img.height;

        if (
          width > height &&
          width > maxSize
        ) {
          height = Math.round(
            (height * maxSize) / width
          );

          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(
            (width * maxSize) / height
          );

          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.75
          )
        );
      };

      img.onerror = () =>
        reject(
          new Error(
            "Could not process image."
          )
        );

      img.src = reader.result;
    };

    reader.onerror = () =>
      reject(
        new Error(
          "Could not read image."
        )
      );

    reader.readAsDataURL(file);
  });
}

/* =========================================
   LOCAL STORAGE
========================================= */

function savedKey(uid) {
  return `bolox_saved_sensitivities_${uid}`;
}

function usageKey(uid) {
  return `bolox_generations_${uid}`;
}

function readSavedSensitivities(uid) {
  try {
    return JSON.parse(
      localStorage.getItem(
        savedKey(uid)
      ) || "[]"
    );
  } catch {
    return [];
  }
}

function getDailyUsage(uid) {
  try {
    const saved =
      localStorage.getItem(
        usageKey(uid)
      );

    if (!saved) return 0;

    const data =
      JSON.parse(saved);

    if (
      data.date !==
      new Date().toDateString()
    ) {
      return 0;
    }

    return data.count || 0;
  } catch {
    return 0;
  }
}

/* =========================================
   PROFILE
========================================= */

function Profile() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [localPhoto, setLocalPhoto] =
    useState("");

  const [previewPhoto, setPreviewPhoto] =
    useState("");

  const [
    savedSensitivities,
    setSavedSensitivities,
  ] = useState([]);

  const [
    generationsUsed,
    setGenerationsUsed,
  ] = useState(0);

  const [myPosts, setMyPosts] =
    useState([]);

  const [likedPosts, setLikedPosts] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("saved");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =========================================
     LOAD LOCAL ACCOUNT DATA
  ========================================= */

  const loadAccountData = (
    currentUser
  ) => {
    if (!currentUser) return;

    setSavedSensitivities(
      readSavedSensitivities(
        currentUser.uid
      )
    );

    setGenerationsUsed(
      getDailyUsage(
        currentUser.uid
      )
    );
  };

  /* =========================================
     LOAD FIRESTORE PROFILE
  ========================================= */

  const loadPublicProfile =
    async (currentUser) => {
      try {
        const profileRef = doc(
          db,
          "users",
          currentUser.uid
        );

        const profileSnap =
          await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data =
            profileSnap.data();

          setUsername(
            data.username ||
              currentUser.displayName ||
              ""
          );

          setBio(
            data.bio || ""
          );
        } else {
          setUsername(
            currentUser.displayName ||
              ""
          );

          setBio("");
        }
      } catch (err) {
        console.error(err);

        setUsername(
          currentUser.displayName ||
            ""
        );
      }
    };

  /* =========================================
     AUTH
  ========================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          setUser(
            currentUser
          );

          if (currentUser) {
            const savedPhoto =
              localStorage.getItem(
                `bolox_profile_photo_${currentUser.uid}`
              );

            if (savedPhoto) {
              setLocalPhoto(
                savedPhoto
              );

              setPreviewPhoto(
                savedPhoto
              );
            } else {
              setPreviewPhoto(
                currentUser.photoURL ||
                  ""
              );
            }

            loadAccountData(
              currentUser
            );

            await loadPublicProfile(
              currentUser
            );
          }

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  /* =========================================
     LOCAL UPDATE EVENTS
  ========================================= */

  useEffect(() => {
    const refreshSaved = () => {
      if (auth.currentUser) {
        loadAccountData(
          auth.currentUser
        );
      }
    };

    window.addEventListener(
      "bolox-sensitivities-updated",
      refreshSaved
    );

    window.addEventListener(
      "bolox-generations-updated",
      refreshSaved
    );

    return () => {
      window.removeEventListener(
        "bolox-sensitivities-updated",
        refreshSaved
      );

      window.removeEventListener(
        "bolox-generations-updated",
        refreshSaved
      );
    };
  }, []);

  /* =========================================
     MY COMMUNITY POSTS
  ========================================= */

  useEffect(() => {
    if (!user) {
      setMyPosts([]);
      return;
    }

    const myPostsQuery = query(
      collection(
        db,
        "communityPosts"
      ),
      where(
        "userId",
        "==",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        myPostsQuery,
        (snapshot) => {
          const loadedPosts =
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

          setMyPosts(
            loadedPosts
          );
        },
        (err) => {
          console.error(err);
        }
      );

    return unsubscribe;
  }, [user]);

  /* =========================================
     LIKED POSTS
  ========================================= */

  useEffect(() => {
    if (!user) {
      setLikedPosts([]);
      return;
    }

    const likedQuery = query(
      collection(
        db,
        "communityPosts"
      ),
      where(
        "likedBy",
        "array-contains",
        user.uid
      )
    );

    const unsubscribe =
      onSnapshot(
        likedQuery,
        (snapshot) => {
          const loadedPosts =
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

          setLikedPosts(
            loadedPosts
          );
        },
        (err) => {
          console.error(err);
        }
      );

    return unsubscribe;
  }, [user]);

  /* =========================================
     PHOTO SELECT
  ========================================= */

  const handlePhotoSelect =
    async (event) => {
      const file =
        event.target.files?.[0];

      if (!file) return;

      setError("");
      setMessage("");

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please select an image file."
        );

        return;
      }

      if (
        file.size >
        8 * 1024 * 1024
      ) {
        setError(
          "Please choose an image smaller than 8 MB."
        );

        return;
      }

      try {
        const compressed =
          await compressImage(file);

        setPreviewPhoto(
          compressed
        );
      } catch {
        setError(
          "Could not process this image."
        );
      }
    };

  /* =========================================
     SAVE PROFILE
  ========================================= */

  const handleSaveProfile =
    async () => {
      if (!auth.currentUser) {
        return;
      }

      setMessage("");
      setError("");

      const cleanUsername =
        username.trim();

      const cleanBio =
        bio.trim();

      if (!cleanUsername) {
        setError(
          "Your BOLOX username cannot be empty."
        );

        return;
      }

      if (
        cleanUsername.length > 24
      ) {
        setError(
          "Your username can be up to 24 characters."
        );

        return;
      }

      if (
        cleanBio.length > 120
      ) {
        setError(
          "Your bio can be up to 120 characters."
        );

        return;
      }

      try {
        await updateProfile(
          auth.currentUser,
          {
            displayName:
              cleanUsername,
          }
        );

        const profileRef = doc(
          db,
          "users",
          auth.currentUser.uid
        );

        await setDoc(
          profileRef,
          {
            uid:
              auth.currentUser.uid,

            username:
              cleanUsername,

            bio:
              cleanBio,

            email:
              auth.currentUser.email ||
              "",

            googlePhoto:
              auth.currentUser.photoURL ||
              "",

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );

        if (previewPhoto) {
          localStorage.setItem(
            `bolox_profile_photo_${auth.currentUser.uid}`,
            previewPhoto
          );

          setLocalPhoto(
            previewPhoto
          );

          window.dispatchEvent(
            new Event(
              "bolox-profile-updated"
            )
          );
        }

        await auth.currentUser.reload();

        setUser({
          ...auth.currentUser,
        });

        setEditing(false);

        setMessage(
          "BOLOX profile updated successfully."
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Could not update your profile."
        );
      }
    };

  /* =========================================
     REMOVE PHOTO
  ========================================= */

  const handleRemovePhoto = () => {
    if (!user) return;

    localStorage.removeItem(
      `bolox_profile_photo_${user.uid}`
    );

    setLocalPhoto("");

    setPreviewPhoto(
      user.photoURL || ""
    );

    window.dispatchEvent(
      new Event(
        "bolox-profile-updated"
      )
    );

    setMessage(
      "Custom BOLOX profile photo removed."
    );

    setError("");
  };

  /* =========================================
     DELETE SAVED SENSITIVITY
  ========================================= */

  const handleDeleteSensitivity =
    (id) => {
      if (!user) return;

      const updated =
        savedSensitivities.filter(
          (item) =>
            item.id !== id
        );

      setSavedSensitivities(
        updated
      );

      localStorage.setItem(
        savedKey(user.uid),
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event(
          "bolox-sensitivities-updated"
        )
      );
    };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main className="profile-page">

        <div className="profile-loading">
          Loading profile...
        </div>

      </main>
    );
  }

  /* =========================================
     SIGNED OUT
  ========================================= */

  if (!user) {
    return (
      <main className="profile-page">

        <div className="profile-login-required">

          <span className="red-label">
            BOLOX ACCOUNT
          </span>

          <h1>
            SIGN IN
            <br />

            <span>
              REQUIRED.
            </span>
          </h1>

          <p>
            Sign in with Google to access
            your BOLOX profile and saved
            content.
          </p>

          <Link
            to="/"
            className="profile-home-btn"
          >
            ← Back Home
          </Link>

        </div>

      </main>
    );
  }

  const displayedPhoto =
    previewPhoto ||
    localPhoto ||
    user.photoURL ||
    "";

  const remaining =
    Math.max(
      0,
      5 - generationsUsed
    );

  return (
    <main className="profile-page">

      {/* =====================================
          PROFILE HEADER
      ===================================== */}

      <section className="profile-header">

        <div>

          <h1>
            YOUR
            <br />

            <span>
              ACCOUNT.
            </span>
          </h1>

          <p>
            Customize your BOLOX identity,
            manage sensitivities and control
            your public community profile.
          </p>

        </div>

        <div className="profile-card">

          {displayedPhoto ? (
            <img
              src={displayedPhoto}
              alt="Profile"
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-fallback">
              B
            </div>
          )}

          {!editing ? (
            <>

              <h2>
                {username ||
                  user.displayName ||
                  "Player"}
              </h2>

              {bio && (
                <p className="profile-bio">
                  {bio}
                </p>
              )}

              <p>
                {user.email}
              </p>

              <span className="profile-plan">
                FREE MEMBER
              </span>

              <Link
                to={`/player/${user.uid}`}
                className="view-public-profile-btn"
              >
                View Public Profile
              </Link>

              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");

                  setPreviewPhoto(
                    localPhoto ||
                      user.photoURL ||
                      ""
                  );
                }}
              >
                Edit Profile
              </button>

            </>
          ) : (

            <div className="profile-editor">

              <label htmlFor="profile-username">
                BOLOX Username
              </label>

              <input
                id="profile-username"
                type="text"
                value={username}
                maxLength={24}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="Your BOLOX username"
              />

              <small className="profile-editor-note">
                {username.length}/24
              </small>

              <label htmlFor="profile-bio">
                Bio
              </label>

              <textarea
                id="profile-bio"
                value={bio}
                maxLength={120}
                onChange={(e) =>
                  setBio(
                    e.target.value
                  )
                }
                placeholder="Tell the community about yourself..."
              />

              <small className="profile-editor-note">
                {bio.length}/120
              </small>

              <label>
                Profile Picture
              </label>

              <label
                htmlFor="profile-photo-upload"
                className="photo-upload-btn"
              >
                Choose Photo
              </label>

              <input
                id="profile-photo-upload"
                className="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={
                  handlePhotoSelect
                }
              />

              <small className="profile-editor-note">
                Your selected photo stays saved
                on this device for now.
              </small>

              {localPhoto && (
                <button
                  type="button"
                  className="remove-photo-btn"
                  onClick={
                    handleRemovePhoto
                  }
                >
                  Remove Custom Photo
                </button>
              )}

              <div className="profile-editor-actions">

                <button
                  type="button"
                  className="save-profile-btn"
                  onClick={
                    handleSaveProfile
                  }
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  className="cancel-profile-btn"
                  onClick={() => {
                    setEditing(false);

                    setPreviewPhoto(
                      localPhoto ||
                        user.photoURL ||
                        ""
                    );

                    setError("");
                  }}
                >
                  Cancel
                </button>

              </div>

            </div>

          )}

          {message && (
            <div className="profile-success">
              {message}
            </div>
          )}

          {error && (
            <div className="profile-edit-error">
              {error}
            </div>
          )}

        </div>

      </section>

      {/* =====================================
          STATS
      ===================================== */}

      <section className="profile-dashboard">

        <div className="profile-stat-card">
          <span>
            ACCOUNT
          </span>

          <strong>
            FREE
          </strong>

          <small>
            Current Plan
          </small>
        </div>

        <div className="profile-stat-card">
          <span>
            GENERATIONS
          </span>

          <strong>
            {remaining}
          </strong>

          <small>
            Remaining Today
          </small>
        </div>

        <div className="profile-stat-card">
          <span>
            POSTS
          </span>

          <strong>
            {myPosts.length}
          </strong>

          <small>
            Community Posts
          </small>
        </div>

        <div className="profile-stat-card">
          <span>
            LIKED
          </span>

          <strong>
            {likedPosts.length}
          </strong>

          <small>
            Liked Setups
          </small>
        </div>

      </section>

      {/* =====================================
          PROFILE CONTENT TABS
      ===================================== */}

      <section className="profile-social-section">

        <div className="profile-tabs">

          <button
            type="button"
            className={
              activeTab === "saved"
                ? "profile-tab active"
                : "profile-tab"
            }
            onClick={() =>
              setActiveTab("saved")
            }
          >
            Saved Sensitivities

            <span>
              {savedSensitivities.length}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "posts"
                ? "profile-tab active"
                : "profile-tab"
            }
            onClick={() =>
              setActiveTab("posts")
            }
          >
            My Posts

            <span>
              {myPosts.length}
            </span>
          </button>

          <button
            type="button"
            className={
              activeTab === "liked"
                ? "profile-tab active"
                : "profile-tab"
            }
            onClick={() =>
              setActiveTab("liked")
            }
          >
            Liked Posts

            <span>
              {likedPosts.length}
            </span>
          </button>

        </div>

        {/* =================================
            SAVED SENSITIVITIES
        ================================= */}

        {activeTab === "saved" && (
          <div className="profile-tab-content">

            <div className="saved-section-header">

              <div>

                <span className="red-label">
                  SAVED SETTINGS
                </span>

                <h2>
                  My Sensitivities
                </h2>

              </div>

              <Link
                to="/store/sensitivity"
                className="profile-action"
              >
                Generate New →
              </Link>

            </div>

            {savedSensitivities.length ===
            0 ? (

              <div className="saved-empty">

                <h3>
                  No saved sensitivities yet.
                </h3>

                <p>
                  Generate a setup and press
                  Save to Profile.
                </p>

              </div>

            ) : (

              <div className="saved-sensitivity-grid">

                {savedSensitivities.map(
                  (item) => (

                    <div
                      className="saved-sensitivity-card"
                      key={item.id}
                    >

                      <div className="saved-card-header">

                        <div>

                          <span>
                            {item.device}
                          </span>

                          <h3>
                            {item.model}
                          </h3>

                        </div>

                        <span className="saved-style">
                          {item.style}
                        </span>

                      </div>

                      <div className="saved-values">

                        {Object.entries(
                          item.settings
                        ).map(
                          ([name, value]) => (

                            <div key={name}>

                              <span>
                                {name}
                              </span>

                              <strong>
                                {value}
                              </strong>

                            </div>

                          )
                        )}

                      </div>

                      <div className="saved-card-bottom">

                        <small>
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </small>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSensitivity(
                              item.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>
        )}

        {/* =================================
            MY POSTS
        ================================= */}

        {activeTab === "posts" && (
          <div className="profile-tab-content">

            <div className="profile-section-heading">

              <span className="red-label">
                COMMUNITY
              </span>

              <h2>
                My Posts
              </h2>

              <p>
                Sensitivity setups you have
                shared with the community.
              </p>

            </div>

            {myPosts.length === 0 ? (

              <div className="saved-empty">

                <h3>
                  No community posts yet.
                </h3>

                <p>
                  Share one of your saved
                  sensitivities with the community.
                </p>

                <Link
                  to="/community"
                  className="profile-action"
                >
                  Go to Community →
                </Link>

              </div>

            ) : (

              <div className="profile-post-grid">

                {myPosts.map(
                  (post) => (

                    <article
                      className="profile-community-card"
                      key={post.id}
                    >

                      <div className="profile-community-header">

                        <div>

                          <span>
                            {post.device}
                          </span>

                          <h3>
                            {post.model}
                          </h3>

                        </div>

                        <strong>
                          {post.style}
                        </strong>

                      </div>

                      <div className="profile-community-values">

                        {Object.entries(
                          post.settings || {}
                        ).map(
                          ([name, value]) => (

                            <div key={name}>

                              <span>
                                {name}
                              </span>

                              <strong>
                                {value}
                              </strong>

                            </div>

                          )
                        )}

                      </div>

                      <div className="profile-community-bottom">

                        <span>
                          ❤️{" "}
                          {post.likedBy?.length ||
                            0}
                        </span>

                        <Link
                          to="/community"
                        >
                          View in Community →
                        </Link>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </div>
        )}

        {/* =================================
            LIKED POSTS
        ================================= */}

        {activeTab === "liked" && (
          <div className="profile-tab-content">

            <div className="profile-section-heading">

              <span className="red-label">
                FAVORITES
              </span>

              <h2>
                Liked Posts
              </h2>

              <p>
                Community setups you liked.
              </p>

            </div>

            {likedPosts.length === 0 ? (

              <div className="saved-empty">

                <h3>
                  No liked posts yet.
                </h3>

                <p>
                  Like a sensitivity in the
                  community and it will appear here.
                </p>

                <Link
                  to="/community"
                  className="profile-action"
                >
                  Explore Community →
                </Link>

              </div>

            ) : (

              <div className="profile-post-grid">

                {likedPosts.map(
                  (post) => (

                    <article
                      className="profile-community-card"
                      key={post.id}
                    >

                      <div className="profile-liked-user">

                        <Link
                          to={`/player/${post.userId}`}
                        >
                          {post.userName ||
                            "Player"}
                        </Link>

                        <span>
                          ❤️{" "}
                          {post.likedBy?.length ||
                            0}
                        </span>

                      </div>

                      <div className="profile-community-header">

                        <div>

                          <span>
                            {post.device}
                          </span>

                          <h3>
                            {post.model}
                          </h3>

                        </div>

                        <strong>
                          {post.style}
                        </strong>

                      </div>

                      <div className="profile-community-values">

                        {Object.entries(
                          post.settings || {}
                        ).map(
                          ([name, value]) => (

                            <div key={name}>

                              <span>
                                {name}
                              </span>

                              <strong>
                                {value}
                              </strong>

                            </div>

                          )
                        )}

                      </div>

                      <div className="profile-community-bottom">

                        <Link
                          to={`/player/${post.userId}`}
                        >
                          View Player →
                        </Link>

                        <Link
                          to="/community"
                        >
                          Community →
                        </Link>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </div>
        )}

      </section>

    </main>
  );
}

export default Profile;