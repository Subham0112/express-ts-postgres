import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { pool } from "../config/db.js";



export const verifyToken = async (req: Request,res: Response,next: NextFunction) => {
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
) as { userId: string; role: string; email:string, token_version:number};
    
  const findUser=await pool.query("SELECT token_version FROM users WHERE id=$1",[decoded.userId])
  if(findUser.rows.length===0){
    return res.status(401).json({
      error:"Session expired, Please login again"
    })
  }
  if (Number(findUser.rows[0].token_version )!== Number(decoded.token_version)) {
    return res.status(401).json({ error: "Logged out from all devices, please login again" });
}

   req.user=decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token please login",
    });
  }
};
