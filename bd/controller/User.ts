import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/user.schems";
import Post from "../models/post.schems";

export const syncUser = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        // Check if user already exists in MongoDB
        let user = await User.findOne({ clerkId: userId });

        if (!user) {
            // Fetch complete user details from Clerk Backend API
            const clerkUser = await clerkClient.users.getUser(userId);

            const email = clerkUser.emailAddresses[0]?.emailAddress || "";
            const username = clerkUser.username || clerkUser.firstName || email.split("@")[0] || `user_${Date.now()}`;
            const fullName = `${clerkUser.firstName || ""}` + (clerkUser.lastName ? ` ${clerkUser.lastName}` : "").trim();
            const profilePicture = clerkUser.imageUrl || "";

            // Create new user in MongoDB
            user = await User.create({
                clerkId: userId,
                username,
                email,
                fullName,
                profilePicture,
            });
            console.log("New user registered in MongoDB:", user);
        }

        res.status(200).json({
            success: true,
            message: "User synced successfully",
            user,
        });
    } catch (error: any) {
        console.error("Error in syncUser controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during sync",
            error: error.message || error,
        });
    }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Fetch posts created by this user
        const posts = await Post.find({ user: dbUser._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            user: {
                _id: dbUser._id,
                username: dbUser.username,
                fullName: dbUser.fullName,
                profilePicture: dbUser.profilePicture,
                followersCount: dbUser.followers ? dbUser.followers.length : 0,
                followingCount: dbUser.following ? dbUser.following.length : 0,
            },
            posts,
        });
    } catch (error: any) {
        console.error("Error in getUserProfile controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message || error,
        });
    }
};
