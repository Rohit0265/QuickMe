import { Router } from "express";
import { syncUser, getUserProfile, searchUsers } from "../controller/User";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/sync", syncUser);
router.get("/search", authMiddleware, searchUsers);
router.get("/profile", authMiddleware, getUserProfile);
router.get("/profile/:profileId", authMiddleware, getUserProfile);

export default router;
