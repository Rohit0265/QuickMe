import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;