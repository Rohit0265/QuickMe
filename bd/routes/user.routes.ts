import { Router } from "express";
import { syncUser } from "../controller/User";

const router = Router();

router.post("/sync", syncUser);

export default router;
