import { Router } from "express";
import upload from "../database/multer";
import { uploadMedia, getPosts } from "../controller/Upload";

const router = Router();

// Expects a form-data field named 'file' and optional field 'type'
router.post("/", upload.single("file"), uploadMedia);
router.get("/", getPosts);

export default router;
