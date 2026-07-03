import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Grid, Heart, MessageCircle, LogOut, Loader2, Camera } from "lucide-react";
import { Link } from "react-router";

interface UserProfileData {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
}

interface CommentData {
  _id: string;
  text: string;
  createdAt: string;
}

interface PostData {
  _id: string;
  url: string;
  type: "image" | "video";
  caption: string;
  likes: string[];
  comments: CommentData[];
  createdAt: string;
}

const UserPage: React.FC = () => {
  const { getToken, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await fetch("http://localhost:8080/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile data.");
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setPosts(data.posts);
      } else {
        throw new Error(data.message || "Failed to load profile.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not retrieve profile info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <p className="text-zinc-400 mb-4">{error || "Failed to load profile."}</p>
        <button
          onClick={fetchProfileAndPosts}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-900 px-4 py-3 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{profile.username}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-red-500 hover:text-red-400 flex items-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Profile Details section */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Info row */}
        <section className="flex flex-col sm:flex-row items-center gap-8 md:gap-16 border-b border-zinc-900 pb-10">
          {/* Profile pic */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600">
              <img
                src={profile.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                alt={profile.username}
                className="w-full h-full rounded-full object-cover border-4 border-black bg-zinc-950"
              />
            </div>
          </div>

          {/* Stats & Description */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
            
            {/* Username + Edit action row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <h2 className="text-xl sm:text-2xl font-light tracking-wide">{profile.username}</h2>
              <Link
                to="/upload"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm py-1.5 px-4 rounded-md transition-colors cursor-pointer"
              >
                Create New Post
              </Link>
            </div>

            {/* Counts */}
            <div className="flex items-center gap-8 text-sm sm:text-base">
              <div>
                <span className="font-semibold text-white mr-1">{posts.length}</span>
                <span className="text-zinc-400">posts</span>
              </div>
              <div>
                <span className="font-semibold text-white mr-1">{profile.followersCount}</span>
                <span className="text-zinc-400">followers</span>
              </div>
              <div>
                <span className="font-semibold text-white mr-1">{profile.followingCount}</span>
                <span className="text-zinc-400">following</span>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <h1 className="font-semibold text-sm sm:text-base text-zinc-100">{profile.fullName}</h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">QuickMe Profile</p>
            </div>

          </div>
        </section>

        {/* Tab Selection */}
        <section className="flex justify-center border-b border-zinc-900">
          <div className="flex gap-16">
            <button className="flex items-center gap-2 border-t border-white py-4 text-xs font-semibold uppercase tracking-wider text-white -mt-[1px]">
              <Grid className="w-4 h-4" />
              <span>Posts</span>
            </button>
          </div>
        </section>

        {/* Grid of posts */}
        <section className="pt-6">
          {posts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center text-zinc-400">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">No Posts Yet</h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                When you share photos or videos, they will appear on your profile.
              </p>
              <Link
                to="/upload"
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                Share your first post
              </Link>
            </div>
          ) : (
            /* Posts Grid */
            <div className="grid grid-cols-3 gap-1.5 sm:gap-4 md:gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="relative aspect-square bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden group cursor-pointer"
                >
                  {/* Thumbnail */}
                  {post.type === "video" ? (
                    <video
                      src={post.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={post.url}
                      alt={post.caption || "QuickMe post"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 transition-opacity duration-200 select-none z-10">
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <Heart className="w-5.5 h-5.5 fill-white text-white" />
                      <span>{post.likes ? post.likes.length : 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <MessageCircle className="w-5.5 h-5.5 fill-white text-white" />
                      <span>{post.comments ? post.comments.length : 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default UserPage;
