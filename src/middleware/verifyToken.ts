import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest,res: Response,next: NextFunction) => {
  const token = req.cookies.accesstoken;

  if (!token) {
    return res.status(401).json({
      message: "No access token found",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      String(process.env.ACCESS_SECRET)
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
