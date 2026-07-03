import { Router } from "express";
import { getUsersList, getMessages, sendMessage } from "../controller/Message";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Apply authMiddleware to all messaging routes
router.use(authMiddleware);

router.get("/users", getUsersList);
router.get("/:recipientId", getMessages);
router.post("/", sendMessage);

export default router;
