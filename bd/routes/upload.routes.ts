import { Router } from "express";
import upload from "../database/multer";
import { uploadMedia } from "../controller/Upload";

const router = Router();

// Expects a form-data field named 'file' and optional field 'type'
router.post("/", upload.single("file"), uploadMedia);

export default router;
