import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  collection,
  doc,
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

function PublicProfile() {
  const { userId } = useParams();

  const [currentUser, setCurrentUser] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [localPhoto, setLocalPhoto] =
    useState("");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setCurrentUser(user);

          if (
            user &&
            user.uid === userId
          ) {
            const savedPhoto =
              localStorage.getItem(
                `bolox_profile_photo_${user.uid}`
              );

            setLocalPhoto(
              savedPhoto || ""
            );
          } else {
            setLocalPhoto("");
          }
        }
      );

    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const profileRef = doc(
      db,
      "users",
      userId
    );

    const unsubscribeProfile =
      onSnapshot(
        profileRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile({
              id: snapshot.id,
              ...snapshot.data(),
            });
          } else {
            setProfile(null);
          }
        },
        (err) => {
          console.error(err);

          setError(
            "Could not load this BOLOX profile."
          );
        }
      );

    const postsQuery = query(
      collection(
        db,
        "communityPosts"
      ),
      where(
        "userId",
        "==",
        userId
      )
    );

    const unsubscribePosts =
      onSnapshot(
        postsQuery,
        (snapshot) => {
          const playerPosts =
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

          setPosts(playerPosts);
          setLoading(false);
        },
        (err) => {
          console.error(err);

          setError(
            "Could not load this player's posts."
          );

          setLoading(false);
        }
      );

    return () => {
      unsubscribeProfile();
      unsubscribePosts();
    };
  }, [userId]);

  if (loading) {
    return (
      <main className="public-profile-page">
        <div className="profile-loading">
          Loading player...
        </div>
      </main>
    );
  }

  const fallbackPost =
    posts[0] || {};

  const username =
    profile?.username ||
    fallbackPost.userName ||
    "BOLOX Player";

  const bio =
    profile?.bio ||
    "BOLOX community player.";

  const isOwnProfile =
    currentUser?.uid === userId;

  const photo =
    isOwnProfile && localPhoto
      ? localPhoto
      : profile?.googlePhoto ||
        fallbackPost.userPhoto ||
        "";

  const totalLikes =
    posts.reduce(
      (total, post) =>
        total +
        (
          post.likedBy?.length ||
          0
        ),
      0
    );

  return (
    <main className="public-profile-page">

      <section className="public-profile-hero">

        <Link
          to="/community"
          className="back-link"
        >
          ← Back to Community
        </Link>

        <div className="public-profile-main">

          <div className="public-profile-avatar-wrap">

            {photo ? (
              <img
                src={photo}
                alt={username}
                className="public-profile-avatar"
              />
            ) : (
              <div className="public-profile-avatar-fallback">
                B
              </div>
            )}

          </div>

          <div className="public-profile-info">

            <span className="red-label">
              BOLOX PLAYER
            </span>

            <h1>
              {username}
            </h1>

            <p>
              {bio}
            </p>

            {isOwnProfile && (
              <Link
                to="/profile"
                className="edit-public-profile-link"
              >
                Edit My Profile
              </Link>
            )}

          </div>

        </div>

      </section>

      {error && (
        <section className="public-profile-message">
          <div className="generator-error">
            {error}
          </div>
        </section>
      )}

      <section className="public-profile-stats">

        <div className="profile-stat-card">
          <span>POSTS</span>

          <strong>
            {posts.length}
          </strong>

          <small>
            Shared Setups
          </small>
        </div>

        <div className="profile-stat-card">
          <span>LIKES</span>

          <strong>
            {totalLikes}
          </strong>

          <small>
            Total Likes
          </small>
        </div>

        <div className="profile-stat-card">
          <span>STATUS</span>

          <strong>
            PLAYER
          </strong>

          <small>
            BOLOX Community
          </small>
        </div>

      </section>

      <section className="public-profile-posts">

        <div className="public-profile-section-title">

          <span className="red-label">
            COMMUNITY
          </span>

          <h2>
            Shared Setups
          </h2>

        </div>

        {posts.length === 0 ? (
          <div className="saved-empty">

            <h3>
              No public setups yet.
            </h3>

            <p>
              This BOLOX player has not
              shared a sensitivity setup.
            </p>

          </div>
        ) : (
          <div className="public-profile-grid">

            {posts.map(
              (post) => (

                <article
                  className="public-profile-post"
                  key={post.id}
                >

                  <div className="public-post-header">

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

                  <div className="public-post-settings">

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

                  <div className="public-post-footer">
                    <span>
                      ❤️{" "}
                      {post.likedBy?.length || 0}
                    </span>
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

export default PublicProfile;