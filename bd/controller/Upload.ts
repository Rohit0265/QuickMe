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
