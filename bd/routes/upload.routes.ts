import { Router } from "express";
import upload from "../database/multer";
import { uploadMedia, getPosts, toggleLike, addComment } from "../controller/Upload";

const router = Router();

// Expects a form-data field named 'file' and optional field 'type'
router.post("/", upload.single("file"), uploadMedia);
router.get("/", getPosts);
router.post("/:postId/like", toggleLike);
router.post("/:postId/comment", addComment);

export default router;
