import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

function savedKey(uid) {
  return `bolox_saved_sensitivities_${uid}`;
}

function getSavedSensitivities(uid) {
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

/* =========================================
   COMMUNITY POST
========================================= */

function CommunityPost({
  post,
  user,
  setMessage,
  setError,
  handleDelete,
}) {
  const [comments, setComments] =
    useState([]);

  const [commentText, setCommentText] =
    useState("");

  const [sendingComment, setSendingComment] =
    useState(false);

  const [liking, setLiking] =
    useState(false);

  const likedBy =
    post.likedBy || [];

  const liked =
    user
      ? likedBy.includes(user.uid)
      : false;

  /* REALTIME COMMENTS */

  useEffect(() => {
    const commentsQuery = query(
      collection(
        db,
        "communityPosts",
        post.id,
        "comments"
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(
        commentsQuery,
        (snapshot) => {
          const loadedComments =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setComments(
            loadedComments
          );
        },
        (err) => {
          console.error(err);
        }
      );

    return unsubscribe;
  }, [post.id]);

  /* LIKE */

  const handleLike = async () => {
    if (!user) {
      setError(
        "Sign in with Google to like community posts."
      );

      return;
    }

    if (liking) return;

    setLiking(true);

    try {
      const postRef = doc(
        db,
        "communityPosts",
        post.id
      );

      if (liked) {
        await updateDoc(
          postRef,
          {
            likedBy:
              arrayRemove(
                user.uid
              ),
          }
        );
      } else {
        await updateDoc(
          postRef,
          {
            likedBy:
              arrayUnion(
                user.uid
              ),
          }
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Could not update your like."
      );
    } finally {
      setLiking(false);
    }
  };

  /* COMMENT */

  const handleComment = async (
    event
  ) => {
    event.preventDefault();

    if (!user) {
      setError(
        "Sign in with Google to comment."
      );

      return;
    }

    const cleanComment =
      commentText.trim();

    if (!cleanComment) {
      return;
    }

    if (
      cleanComment.length > 200
    ) {
      setError(
        "Comments can be up to 200 characters."
      );

      return;
    }

    setSendingComment(true);
    setError("");

    try {
      await addDoc(
        collection(
          db,
          "communityPosts",
          post.id,
          "comments"
        ),
        {
          userId:
            user.uid,

          userName:
            user.displayName ||
            "BOLOX Player",

          userPhoto:
            user.photoURL || "",

          text:
            cleanComment,

          createdAt:
            serverTimestamp(),
        }
      );

      setCommentText("");
    } catch (err) {
      console.error(err);

      setError(
        "Could not post your comment."
      );
    } finally {
      setSendingComment(false);
    }
  };

  /* COPY */

  const handleCopy = async () => {
    const text = [
      "BOLOX Community Sensitivity",
      `Player: ${post.userName}`,
      `Device: ${post.device}`,
      `Model: ${post.model}`,
      `Play Style: ${post.style}`,
      "",
      ...Object.entries(
        post.settings || {}
      ).map(
        ([name, value]) =>
          `${name}: ${value}`
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(
        text
      );

      setMessage(
        "Sensitivity copied."
      );

      setError("");
    } catch {
      setError(
        "Could not copy this sensitivity."
      );
    }
  };

  return (
    <article className="community-post">

      {/* USER */}

      <div className="community-user">

        {post.userPhoto ? (
          <img
            src={post.userPhoto}
            alt=""
          />
        ) : (
          <div className="community-avatar-fallback">
            B
          </div>
        )}

        <div>
          <strong>
            {post.userName ||
              "BOLOX Player"}
          </strong>

          <small>
            BOLOX PLAYER
          </small>
        </div>

      </div>

      {/* DEVICE */}

      <div className="community-post-title">

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

      {/* SETTINGS */}

      <div className="community-settings">

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

      {/* SOCIAL STATS */}

      <div className="community-social-stats">

        <span>
          ❤️ {likedBy.length}
        </span>

        <span>
          💬 {comments.length}
        </span>

      </div>

      {/* ACTIONS */}

      <div className="community-actions">

        <button
          type="button"
          className={
            liked
              ? "community-like liked"
              : "community-like"
          }
          onClick={handleLike}
          disabled={liking}
        >
          {liked
            ? "❤️ Liked"
            : "♡ Like"}
        </button>

        <button
          type="button"
          onClick={handleCopy}
        >
          Copy Settings
        </button>

        {user &&
          post.userId ===
            user.uid && (
            <button
              type="button"
              className="community-delete"
              onClick={() =>
                handleDelete(
                  post
                )
              }
            >
              Delete
            </button>
          )}

      </div>

      {/* COMMENTS */}

      <div className="community-comments">

        <div className="comments-title">
          Comments
          <span>
            {comments.length}
          </span>
        </div>

        {comments.length === 0 ? (
          <p className="no-comments">
            No comments yet.
          </p>
        ) : (
          <div className="comments-list">

            {comments.map(
              (comment) => (

                <div
                  className="community-comment"
                  key={comment.id}
                >

                  {comment.userPhoto ? (
                    <img
                      src={
                        comment.userPhoto
                      }
                      alt=""
                    />
                  ) : (
                    <div className="comment-avatar">
                      B
                    </div>
                  )}

                  <div>

                    <strong>
                      {comment.userName ||
                        "BOLOX Player"}
                    </strong>

                    <p>
                      {comment.text}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>
        )}

        {/* COMMENT FORM */}

        {user ? (

          <form
            className="comment-form"
            onSubmit={
              handleComment
            }
          >

            <input
              type="text"
              value={commentText}
              maxLength={200}
              placeholder="Write a comment..."
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              disabled={
                sendingComment ||
                !commentText.trim()
              }
            >
              {sendingComment
                ? "..."
                : "Post"}
            </button>

          </form>

        ) : (

          <p className="comment-login-note">
            Sign in to comment.
          </p>

        )}

      </div>

    </article>
  );
}

/* =========================================
   COMMUNITY PAGE
========================================= */

function Community() {
  const [user, setUser] =
    useState(null);

  const [authReady, setAuthReady] =
    useState(false);

  const [
    savedSensitivities,
    setSavedSensitivities,
  ] = useState([]);

  const [
    selectedSensitivity,
    setSelectedSensitivity,
  ] = useState("");

  const [posts, setPosts] =
    useState([]);

  const [posting, setPosting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* AUTH */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(
            currentUser
          );

          if (currentUser) {
            const saved =
              getSavedSensitivities(
                currentUser.uid
              );

            setSavedSensitivities(
              saved
            );

            if (
              saved.length > 0
            ) {
              setSelectedSensitivity(
                String(
                  saved[0].id
                )
              );
            }
          } else {
            setSavedSensitivities(
              []
            );

            setSelectedSensitivity(
              ""
            );
          }

          setAuthReady(true);
        }
      );

    return unsubscribe;
  }, []);

  /* REALTIME POSTS */

  useEffect(() => {
    const postsQuery =
      query(
        collection(
          db,
          "communityPosts"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

    const unsubscribe =
      onSnapshot(
        postsQuery,
        (snapshot) => {
          const communityPosts =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data(),
              })
            );

          setPosts(
            communityPosts
          );
        },
        (err) => {
          console.error(err);

          setError(
            "Could not load the BOLOX community."
          );
        }
      );

    return unsubscribe;
  }, []);

  /* SHARE */

  const handleShare =
    async () => {
      setMessage("");
      setError("");

      if (!user) {
        setError(
          "Sign in with Google before sharing a sensitivity."
        );

        return;
      }

      const sensitivity =
        savedSensitivities.find(
          (item) =>
            String(item.id) ===
            selectedSensitivity
        );

      if (!sensitivity) {
        setError(
          "Choose a saved sensitivity first."
        );

        return;
      }

      setPosting(true);

      try {
        await addDoc(
          collection(
            db,
            "communityPosts"
          ),
          {
            userId:
              user.uid,

            userName:
              user.displayName ||
              "BOLOX Player",

            userPhoto:
              user.photoURL || "",

            device:
              sensitivity.device,

            model:
              sensitivity.model,

            style:
              sensitivity.style,

            settings:
              sensitivity.settings,

            likedBy: [],

            createdAt:
              serverTimestamp(),
          }
        );

        setMessage(
          "Sensitivity shared with the BOLOX community."
        );
      } catch (err) {
        console.error(err);

        setError(
          "Could not share this sensitivity."
        );
      } finally {
        setPosting(false);
      }
    };

  /* DELETE OWN POST */

  const handleDelete =
    async (post) => {
      if (!user) return;

      if (
        post.userId !==
        user.uid
      ) {
        return;
      }

      try {
        await deleteDoc(
          doc(
            db,
            "communityPosts",
            post.id
          )
        );

        setMessage(
          "Community post deleted."
        );
      } catch (err) {
        console.error(err);

        setError(
          "Could not delete this post."
        );
      }
    };

  if (!authReady) {
    return (
      <main className="community-page">

        <div className="profile-loading">
          Loading community...
        </div>

      </main>
    );
  }

  return (
    <main className="community-page">

      {/* HERO */}

      <section className="community-hero">

        <span className="red-label">
          BOLOX PLAYERS
        </span>

        <h1>
          COMMUNITY
          <br />
          <span>
            SETUPS.
          </span>
        </h1>

        <p>
          Share your saved Free Fire
          sensitivity setups, discover
          settings from other BOLOX players,
          like their setups and join the
          conversation.
        </p>

      </section>

      <section className="community-content">

        {/* SHARE CARD */}

        <div className="community-share-card">

          <div>

            <span className="red-label">
              SHARE YOUR SETUP
            </span>

            <h2>
              Post a Sensitivity
            </h2>

          </div>

          {!user ? (

            <div className="community-login-message">

              <p>
                Sign in with Google
                to share your BOLOX
                sensitivity.
              </p>

              <Link
                to="/"
                className="profile-action"
              >
                Go Home
              </Link>

            </div>

          ) : savedSensitivities.length ===
            0 ? (

            <div className="community-login-message">

              <p>
                You don't have any
                saved sensitivities yet.
              </p>

              <Link
                to="/store/sensitivity"
                className="profile-action"
              >
                Generate One →
              </Link>

            </div>

          ) : (

            <div className="community-share-form">

              <label htmlFor="community-sensitivity">
                Select a saved
                sensitivity
              </label>

              <select
                id="community-sensitivity"
                value={
                  selectedSensitivity
                }
                onChange={(e) =>
                  setSelectedSensitivity(
                    e.target.value
                  )
                }
              >

                {savedSensitivities.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.device}
                      {" — "}
                      {item.model}
                      {" — "}
                      {item.style}
                    </option>

                  )
                )}

              </select>

              <button
                type="button"
                className="community-share-btn"
                onClick={
                  handleShare
                }
                disabled={
                  posting
                }
              >
                {posting
                  ? "Sharing..."
                  : "Share to Community →"}
              </button>

            </div>

          )}

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

        </div>

        {/* FEED HEADER */}

        <div className="community-feed-header">

          <div>

            <span className="red-label">
              LIVE COMMUNITY
            </span>

            <h2>
              Latest Setups
            </h2>

          </div>

          <span>
            {posts.length} POSTS
          </span>

        </div>

        {/* POSTS */}

        {posts.length === 0 ? (

          <div className="saved-empty">

            <h3>
              No community
              posts yet.
            </h3>

            <p>
              Be the first BOLOX
              player to share a setup.
            </p>

          </div>

        ) : (

          <div className="community-grid">

            {posts.map(
              (post) => (

                <CommunityPost
                  key={post.id}
                  post={post}
                  user={user}
                  setMessage={
                    setMessage
                  }
                  setError={
                    setError
                  }
                  handleDelete={
                    handleDelete
                  }
                />

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}

export default Community;