import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";



export const verifyToken = (req: Request,res: Response,next: NextFunction) => {
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
) as { userId: string; role: string; email:string};

   req.user=decoded;
   
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token please login",
    });
  }
};
