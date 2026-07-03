import { Router } from "express";
import { syncUser, getUserProfile } from "../controller/User";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/sync", syncUser);
router.get("/profile", authMiddleware, getUserProfile);

export default router;
