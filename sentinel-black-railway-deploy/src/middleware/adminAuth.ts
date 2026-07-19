import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { Role } from "@prisma/client";

export interface AdminRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

export async function adminAuthenticate(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) { res.status(401).json({ error: "No token provided" }); return; }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;

    if (req.user.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export default adminAuthenticate;

