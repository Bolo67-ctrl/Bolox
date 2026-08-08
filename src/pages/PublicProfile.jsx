import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

function PublicProfile() {
  const { userId } = useParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const postsQuery = query(
      collection(db, "communityPosts"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const playerPosts = snapshot.docs
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
          "Could not load this BOLOX player."
        );

        setLoading(false);
      }
    );

    return unsubscribe;
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

  if (error) {
    return (
      <main className="public-profile-page">

        <div className="public-profile-empty">

          <h1>
            PLAYER
            <br />
            <span>UNAVAILABLE.</span>
          </h1>

          <p>{error}</p>

          <Link
            to="/community"
            className="profile-action"
          >
            ← Back to Community
          </Link>

        </div>

      </main>
    );
  }

  if (posts.length === 0) {
    return (
      <main className="public-profile-page">

        <div className="public-profile-empty">

          <span className="red-label">
            BOLOX PLAYER
          </span>

          <h1>
            NO PUBLIC
            <br />
            <span>POSTS.</span>
          </h1>

          <p>
            This player has not shared any
            community setups yet.
          </p>

          <Link
            to="/community"
            className="profile-action"
          >
            ← Back to Community
          </Link>

        </div>

      </main>
    );
  }

  const player = posts[0];

  const totalLikes = posts.reduce(
    (total, post) =>
      total +
      (post.likedBy?.length || 0),
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

            {player.userPhoto ? (
              <img
                src={player.userPhoto}
                alt={player.userName || ""}
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
              {player.userName ||
                "BOLOX Player"}
            </h1>

            <p>
              Community profile and shared
              Free Fire sensitivity setups.
            </p>

          </div>

        </div>

      </section>

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

        <div className="public-profile-grid">

          {posts.map((post) => (

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
                  {post.likedBy?.length ||
                    0}
                </span>

              </div>

            </article>

          ))}

        </div>

      </section>

    </main>
  );
}

export default PublicProfile;