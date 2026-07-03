import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Search, MessageSquare, User, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

interface SearchUserResult {
  _id: string;
  username: string;
  fullName: string;
  profilePicture: string;
}

const SearchPage: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300); // Debounce search requests by 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Search failed.");
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.users);
      } else {
        throw new Error(data.message || "Failed to search users.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not retrieve search results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Search Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-900 px-4 py-3 flex items-center justify-between max-w-4xl mx-auto w-full">
        <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <span className="font-semibold text-base">Search Accounts</span>
        <div className="w-5"></div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* Search Input Box */}
        <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus-within:border-zinc-500 transition-colors">
          <Search className="w-5 h-5 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or full name..."
            className="flex-1 bg-transparent text-sm placeholder-zinc-500 text-white focus:outline-none"
          />
        </div>

        {/* Results Pane */}
        <div className="space-y-3">
          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm text-center py-6">{error}</p>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-10">No accounts found for "{query}"</p>
          )}

          {!loading && !query && (
            <div className="text-center py-16 text-zinc-500 space-y-2">
              <Search className="w-12 h-12 stroke-[1.2] mx-auto text-zinc-700" />
              <p className="text-sm">Search for accounts to view their feed or send messages.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl divide-y divide-zinc-900 overflow-hidden shadow-2xl">
              {results.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-900/10 transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 overflow-hidden mr-4">
                    <img
                      src={user.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="overflow-hidden text-left">
                      <p className="font-semibold text-sm truncate text-white">{user.username}</p>
                      <p className="text-zinc-400 text-xs truncate mt-0.5">{user.fullName}</p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/user/${user._id}`)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs font-semibold py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                      title="View Profile"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Profile</span>
                    </button>
                    <button
                      onClick={() => navigate(`/messages?userId=${user._id}`)}
                      className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                      title="Send Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default SearchPage;
