import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }

        const filePath = req.file.path;
        const uploadType = req.body.type || "auto"; // 'video' or 'image'

        console.log(`Uploading file ${req.file.originalname} (${uploadType}) from path ${filePath} to Cloudinary...`);

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

        res.status(200).json({
            success: true,
            message: "File uploaded successfully to Cloudinary",
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            duration: result.duration || null,
            bytes: result.bytes,
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
            message: "Failed to upload file to Cloudinary",
            error: error.message || error,
        });
    }
};
