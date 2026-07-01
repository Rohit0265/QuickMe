import React, { useEffect } from 'react'
import Login from '../components/Login'
import { useUser, useAuth } from '@clerk/clerk-react'

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
            <div className="flex h-screen w-full items-center justify-center">
                <span>Loading...</span>
            </div>
        );
    }

    if (isSignedIn) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold">Welcome {user?.fullName || user?.username}</h1>
            </div>
        )
    }

    return (
        <div className='flex w-full items-center justify-center'>
            <Login />
        </div>
    )
}

export default LoginPage