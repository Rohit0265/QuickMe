import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["image", "video"],
        required: true,
    },
    caption: {
        type: String,
        default: "",
    }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;
