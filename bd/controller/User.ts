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
        const { profileId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const currentUser = await User.findOne({ clerkId: userId });
        if (!currentUser) {
            res.status(404).json({ success: false, message: "Logged in user not found in database" });
            return;
        }

        let targetUser = currentUser;
        if (profileId) {
            const foundUser = await User.findById(profileId);
            if (!foundUser) {
                res.status(404).json({ success: false, message: "Profile user not found" });
                return;
            }
            targetUser = foundUser;
        }

        // Fetch posts created by target user
        const posts = await Post.find({ user: targetUser._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            user: {
                _id: targetUser._id,
                username: targetUser.username,
                fullName: targetUser.fullName,
                profilePicture: targetUser.profilePicture,
                followersCount: targetUser.followers ? targetUser.followers.length : 0,
                followingCount: targetUser.following ? targetUser.following.length : 0,
                isSelf: targetUser._id.toString() === currentUser._id.toString(),
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

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const query = (req.query.q as string) || "";

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const currentUser = await User.findOne({ clerkId: userId });
        if (!currentUser) {
            res.status(404).json({ success: false, message: "Logged in user not found in database" });
            return;
        }

        if (!query.trim()) {
            res.status(200).json({ success: true, users: [] });
            return;
        }

        // Find users matching search term (username or fullName), excluding current user
        const users = await User.find({
            $and: [
                { _id: { $ne: currentUser._id } },
                {
                    $or: [
                        { username: { $regex: query, $options: "i" } },
                        { fullName: { $regex: query, $options: "i" } },
                    ],
                },
            ],
        }).select("username fullName profilePicture");

        res.status(200).json({ success: true, users });
    } catch (error: any) {
        console.error("Error in searchUsers controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during search",
            error: error.message || error,
        });
    }
};
