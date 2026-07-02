import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

interface PostData {
  _id: string;
  user: UserProfile;
  url: string;
  publicId: string;
  type: "image" | "video";
  caption: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive client-side state for likes and bookmarks
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8080/api/upload");
      if (!response.ok) {
        throw new Error("Failed to fetch posts from server.");
      }
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        throw new Error(data.message || "Unknown error occurred.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleSave = (postId: string) => {
    setSavedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const formatDate = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} MINUTES AGO`;
    if (diffHours < 24) return `${diffHours} HOURS AGO`;
    if (diffDays < 7) return `${diffDays} DAYS AGO`;
    return postDate.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased pb-20">
      {/* Import Instagram Cursive Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap');
        .instagram-logo {
          font-family: 'Grand Hotel', cursive;
        }
      `}</style>

      {/* Header (Top Nav) */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-900 px-4 py-2 flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link to="/" className="instagram-logo text-3xl font-normal tracking-wide text-white select-none">
          Instagram
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/upload"
            className="text-white hover:opacity-80 transition-opacity p-1.5"
            title="Create Post"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} />
              <line x1="12" y1="8" x2="12" y2="16" strokeWidth={2} />
              <line x1="8" y1="12" x2="16" y2="12" strokeWidth={2} />
            </svg>
          </Link>
        </div>
      </header>

      {/* Centered Posts Feed */}
      <main className="max-w-[470px] mx-auto px-4 pt-6 space-y-6 w-full">
        
        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-black border border-zinc-900 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-900 animate-pulse"></div>
                  <div className="h-3 w-24 bg-zinc-900 rounded animate-pulse"></div>
                </div>
                <div className="w-full aspect-square bg-zinc-900 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-zinc-900 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="border border-zinc-900 rounded-lg p-8 text-center space-y-3">
            <p className="text-zinc-400 text-sm">{error}</p>
            <button
              onClick={fetchPosts}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs py-1.5 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Refresh Feed
            </button>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && !loading && !error && (
          <div className="border border-zinc-900 rounded-lg p-12 text-center space-y-4">
            <h3 className="font-bold text-lg">No Posts Yet</h3>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Follow profiles or upload your own photos and videos to fill your feed.
            </p>
            <Link
              to="/upload"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-2 px-6 rounded-lg transition-all cursor-pointer"
            >
              Upload First Media
            </Link>
          </div>
        )}

        {/* Posts Feed */}
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = !!likedPosts[post._id];
              const isSaved = !!savedPosts[post._id];

              return (
                <article
                  key={post._id}
                  className="bg-black border border-zinc-900 rounded-lg overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
                        <img
                          src={post.user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                          alt={post.user?.username || "user"}
                          className="w-full h-full rounded-full object-cover border border-black bg-zinc-800"
                        />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="font-semibold text-sm text-white hover:underline cursor-pointer">
                          {post.user?.username || "anonymous"}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {post.user?.fullName || "Anonymous"}
                        </p>
                      </div>
                    </div>
                    <button className="text-white hover:text-zinc-400 transition-colors cursor-pointer">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Media */}
                  <div className="bg-zinc-950 flex items-center justify-center overflow-hidden aspect-square border-y border-zinc-900 select-none">
                    {post.type === "video" ? (
                      <video
                        src={post.url}
                        controls
                        loop
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={post.url}
                        alt={post.caption || "Instagram post"}
                        loading="lazy"
                        className="w-full h-full object-contain"
                        onDoubleClick={() => toggleLike(post._id)}
                      />
                    )}
                  </div>

                  {/* Post Actions Panel */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(post._id)}
                          className="hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Heart
                            className={`w-6 h-6 transition-colors ${
                              isLiked ? "fill-red-500 text-red-500" : "text-white"
                            }`}
                          />
                        </button>
                        <button className="hover:scale-110 transition-transform cursor-pointer">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </button>
                        <button className="hover:scale-110 transition-transform cursor-pointer">
                          <Send className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <button
                        onClick={() => toggleSave(post._id)}
                        className="hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Bookmark
                          className={`w-6 h-6 transition-colors ${
                            isSaved ? "fill-white text-white" : "text-white"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Likes count */}
                    <p className="text-sm font-semibold text-white text-left">
                      {isLiked ? 15 : 14} likes
                    </p>

                    {/* Caption */}
                    {post.caption && (
                      <div className="text-sm text-left">
                        <span className="font-semibold text-white mr-2 hover:underline cursor-pointer">
                          {post.user?.username || "anonymous"}
                        </span>
                        <span className="text-zinc-200">{post.caption}</span>
                      </div>
                    )}

                    {/* Mock comment section */}
                    <div className="text-left space-y-1">
                      <p className="text-zinc-500 text-xs cursor-pointer hover:text-zinc-400">
                        View all 3 comments
                      </p>
                      <p className="text-xs uppercase text-zinc-500 tracking-wider">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Add Comment Row */}
                  <div className="flex items-center gap-2 px-3.5 py-3 border-t border-zinc-900 bg-black">
                    <Smile className="w-5 h-5 text-zinc-400 shrink-0 cursor-pointer hover:text-zinc-200" />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-transparent text-sm placeholder-zinc-500 text-white focus:outline-none"
                    />
                    <button className="text-sky-500 hover:text-white font-semibold text-sm cursor-pointer disabled:opacity-50" disabled>
                      Post
                    </button>
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

export default Home;