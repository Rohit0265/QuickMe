import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/express";
import fs from "fs";
import User from "../models/user.schems";
import Post from "../models/post.schems";

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get authenticated user ID from Clerk
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });
            return;
        }

        // Find the user in MongoDB
        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "User not found in database. Make sure you are synced." });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }

        const filePath = req.file.path;
        const uploadType = req.body.type || "auto"; // 'video' or 'image'
        const caption = req.body.caption || "";

        console.log(`Uploading file ${req.file.originalname} (${uploadType}) for user ${dbUser.username} to Cloudinary...`);

        // Map request type to Cloudinary resource types
        let resourceType: "auto" | "image" | "video" | "raw" = "auto";
        if (uploadType === "video") {
            resourceType = "video";
        } else if (uploadType === "image") {
            resourceType = "image";
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: resourceType,
            folder: "ig_cloudinary_uploads",
        });

        // Clean up the local temporary file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        console.log("Cloudinary upload successful:", result.secure_url);

        // Create new Post in MongoDB linked to the user
        const newPost = await Post.create({
            user: dbUser._id,
            url: result.secure_url,
            publicId: result.public_id,
            type: uploadType === "video" ? "video" : "image",
            caption,
        });

        // Populate user details for returning to client
        const populatedPost = await newPost.populate("user", "username fullName profilePicture");

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            post: populatedPost,
        });
    } catch (error: any) {
        console.error("Error in uploadMedia controller:", error);

        // Attempt to clean up temp file in case of failure
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error("Failed to delete temp file during error cleanup:", cleanupErr);
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to create post / upload file",
            error: error.message || error,
        });
    }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const posts = await Post.find()
            .populate("user", "username fullName profilePicture")
            .populate("comments.user", "username fullName profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            posts,
        });
    } catch (error: any) {
        console.error("Error in getPosts controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message || error,
        });
    }
};

export const toggleLike = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });
            return;
        }

        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "User not found in database" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        const likeIndex = post.likes.indexOf(dbUser._id);
        let isLiked = false;

        if (likeIndex > -1) {
            // Already liked, so unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Not liked, so like
            post.likes.push(dbUser._id);
            isLiked = true;
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: isLiked ? "Post liked" : "Post unliked",
            likes: post.likes,
            isLiked,
        });
    } catch (error: any) {
        console.error("Error in toggleLike controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle like",
            error: error.message || error,
        });
    }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const { userId } = getAuth(req);

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });
            return;
        }

        if (!text || text.trim() === "") {
            res.status(400).json({ success: false, message: "Comment text is required" });
            return;
        }

        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "User not found in database" });
            return;
        }

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        // Add the comment subdocument
        post.comments.push({
            user: dbUser._id,
            text: text.trim(),
            createdAt: new Date(),
        });

        await post.save();

        // Fetch post and populate user info on the new comments list to send to client
        const populatedPost = await Post.findById(postId)
            .populate("comments.user", "username fullName profilePicture");

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comments: populatedPost?.comments || [],
        });
    } catch (error: any) {
        console.error("Error in addComment controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add comment",
            error: error.message || error,
        });
    }
};
