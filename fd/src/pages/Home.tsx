import React, { useEffect, useState } from "react";
import { Link } from "react-router";

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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-gray-950 to-black text-white font-sans antialiased">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
              C
            </span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CloudFeed
            </span>
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Post
          </Link>
        </div>
      </nav>

      {/* Main Content Feed */}
      <main className="max-w-xl mx-auto px-4 py-8 relative z-10">
        
        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-8 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-white/10 rounded"></div>
                    <div className="h-2 w-16 bg-white/10 rounded"></div>
                  </div>
                </div>
                <div className="h-64 w-full bg-white/10 rounded-xl"></div>
                <div className="h-3 w-3/4 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-6 text-center space-y-3 shadow-xl">
            <svg className="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-bold text-lg text-red-200">Could Not Load Feed</h3>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2 px-4 rounded-xl border border-white/5 transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && !loading && !error && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg text-gray-200">No Posts Yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Be the first to share a beautiful picture or a cool video to the global timeline!
            </p>
            <Link
              to="/upload"
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm py-2.5 px-6 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Upload First Media
            </Link>
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post._id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.user?.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                      alt={post.user?.username || "user"}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div className="text-left">
                      <p className="font-bold text-sm text-gray-200">
                        @{post.user?.username || "anonymous"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {post.user?.fullName || "Anonymous User"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {formatDate(post.createdAt)}
                  </span>
                </div>

                {/* Media Container */}
                <div className="bg-black flex items-center justify-center overflow-hidden aspect-video sm:aspect-square max-h-[500px]">
                  {post.type === "video" ? (
                    <video
                      src={post.url}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={post.url}
                      alt={post.caption || "Post media"}
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Post Footer */}
                {post.caption && (
                  <div className="p-4 border-t border-white/5 text-left bg-black/10">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <span className="font-bold text-white mr-2">
                        @{post.user?.username || "anonymous"}
                      </span>
                      {post.caption}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default Home;