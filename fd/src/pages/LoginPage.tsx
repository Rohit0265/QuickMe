import React, { useEffect } from 'react'
import Login from '../components/Login'
import { useUser, useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

const LoginPage = () => {
    const { user, isLoaded } = useUser()
    const { isSignedIn, getToken } = useAuth()

    useEffect(() => {
        const syncUserWithDatabase = async () => {
            if (isSignedIn) {
                try {
                    const token = await getToken();
                    const response = await fetch("http://localhost:8080/api/user/sync", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    console.log("User sync response:", data);
                } catch (error) {
                    console.error("Failed to sync user with database:", error);
                }
            }
        };

        syncUserWithDatabase();
    }, [isSignedIn, getToken]);

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-zinc-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans antialiased flex flex-col justify-between pb-12">
            
            {/* Import Cursive Instagram Font */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap');
                .instagram-logo {
                    font-family: 'Grand Hotel', cursive;
                }
            `}</style>

            {/* Back header */}
            <header className="px-6 py-4 flex items-center max-w-4xl mx-auto w-full">
                <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to Feed
                </Link>
            </header>

            {/* Login Box Centered */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-[350px] w-full flex flex-col items-center">
                    
                    {/* Main Auth Card */}
                    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-sm p-8 flex flex-col items-center shadow-lg">
                        
                        {/* Wordmark Logo */}
                        <h1 className="instagram-logo text-5xl font-normal tracking-wide text-white select-none mb-8">
                            Instagram
                        </h1>

                        {/* Signed In Welcome State */}
                        {isSignedIn ? (
                            <div className="text-center w-full space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold text-zinc-100">
                                        Signed in successfully
                                    </h2>
                                    <p className="text-xs text-zinc-400">
                                        Welcome, <span className="text-white font-semibold">{user?.fullName || user?.username}</span>
                                    </p>
                                </div>

                                <Link
                                    to="/"
                                    className="block w-full bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm py-2 rounded-lg text-center transition-colors cursor-pointer"
                                >
                                    Go to Home Feed
                                </Link>
                            </div>
                        ) : (
                            /* Clerk Authentication Box wrapper */
                            <div className="w-full flex justify-center mt-2">
                                <Login />
                            </div>
                        )}

                    </div>

                    {/* Bottom disclaimer */}
                    <p className="text-zinc-500 text-xs mt-6 text-center leading-relaxed">
                        InstaCloud from Google DeepMind.<br />
                        This application is secured using Clerk authentication and stores files on Cloudinary.
                    </p>

                </div>
            </main>

            {/* Footer Metadata */}
            <footer className="text-[11px] text-zinc-600 text-center space-y-3 px-4">
                <div className="flex flex-wrap justify-center gap-3">
                    <span className="hover:underline cursor-pointer">About</span>
                    <span className="hover:underline cursor-pointer">Blog</span>
                    <span className="hover:underline cursor-pointer">API</span>
                    <span className="hover:underline cursor-pointer">Privacy</span>
                    <span className="hover:underline cursor-pointer">Terms</span>
                    <span className="hover:underline cursor-pointer">Locations</span>
                    <span className="hover:underline cursor-pointer">Instagram Lite</span>
                </div>
                <p>© 2026 INSTACLOUD FROM GOOGLE DEEPMIND</p>
            </footer>

        </div>
    )
}

export default LoginPage