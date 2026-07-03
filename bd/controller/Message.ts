import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/user.schems";
import Message from "../models/message.schems";

export const getUsersList = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "Logged in user not found in database" });
            return;
        }

        // Find all users except the current user
        const users = await User.find({ _id: { $ne: dbUser._id } })
            .select("username fullName profilePicture");

        res.status(200).json({ success: true, users });
    } catch (error: any) {
        console.error("Error in getUsersList:", error);
        res.status(500).json({ success: false, message: "Failed to get users", error: error.message });
    }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const { recipientId } = req.params;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "Logged in user not found in database" });
            return;
        }

        // Find all messages sent between the current user and the recipient
        const messages = await Message.find({
            $or: [
                { sender: dbUser._id, recipient: recipientId },
                { sender: recipientId, recipient: dbUser._id }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, messages });
    } catch (error: any) {
        console.error("Error in getMessages:", error);
        res.status(500).json({ success: false, message: "Failed to load messages", error: error.message });
    }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = getAuth(req);
        const { recipientId, text } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (!text || text.trim() === "") {
            res.status(400).json({ success: false, message: "Message text is required" });
            return;
        }

        const dbUser = await User.findOne({ clerkId: userId });
        if (!dbUser) {
            res.status(404).json({ success: false, message: "Logged in user not found in database" });
            return;
        }

        const message = await Message.create({
            sender: dbUser._id,
            recipient: recipientId,
            text: text.trim(),
        });

        // Broadcast to sender and recipient rooms if Socket.io is active
        const io = req.app.get("io");
        if (io) {
            const senderRoom = dbUser._id.toString();
            const recipientRoom = recipientId.toString();
            console.log(`[Socket] Broadcasting message from ${senderRoom} to recipient ${recipientRoom}`);
            io.to(senderRoom).to(recipientRoom).emit("new_message", message);
        }

        res.status(201).json({ success: true, message });
    } catch (error: any) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
    }
};
