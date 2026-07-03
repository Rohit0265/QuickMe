import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please log in first" });
  }

  next();
};