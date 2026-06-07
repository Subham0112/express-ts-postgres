import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";


export const register = async (req:Request, res:Response)=>{
    try {
        const {name,email,password} =req.body;
        const findUser=await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(findUser.rows.length>0){
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPassword= await bcrypt.hash(password,10);
        const result = await pool.query("INSERT INTO users (user_name, email,password) VALUES ($1, $2, $3) RETURNING *", [name, email,hashPassword]);
        res.status(201).json(result.rows[0],)
        res.status(201).json({message:"User Registered Successfully"})
    } catch (err) {
        console.error("Error creating user", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req:Request ,res:Response )=>{
    try{
        const {email,password}=req.body;
        const findUser= await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if (findUser.rows.length === 0){
             return res.status(401).json({
              message: "Invalid email or password"
           });
        }
        const user = findUser.rows[0];
        const matchPassword= await bcrypt.compare(password,user.password)
        if(!matchPassword){
            console.log("invalid email or password");
        }

        const accessToken=jwt.sign(
            {
                userId:user.id,
                name:user.name
            },
            String(process.env.ACCESS_SECRET),
            {expiresIn:"25s"}
        )
        const refreshToken=jwt.sign(
            {
                userId:user.id
            },
           String(process.env.REFRESH_SECRET),
            {expiresIn:"10m"}
        )
     
        await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2",[refreshToken,user.id]);

        res.cookie("accesstoken",accessToken)
        res.cookie("refreshtoken",refreshToken)
          res.json({
          message: "Login successful",
          user: { id: user.id, email: user.email },
           });
    }catch(err){
        console.error("Error Login Users users", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
   
};

export const getUser = async (req:Request,res:Response)=>{
    try{
        const userId=req.user?.userId;
        const result= await pool.query("SELECT id,user_name,email FROM users WHERE id=$1",[userId]);

        res.json({
            message: "User fetched successfully",
            user: result.rows[0]
        });
    }catch(err){
        console.error("Error fetching profile", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const refreshToken = async (req:Request,res:Response)=>{
    try{
        const refreshToken=req.cookies.refreshtoken;
        if(!refreshToken){
            return res.status(401).json({
                message: "No refresh token found"
            })
        }
        const decoded:any=jwt.verify(refreshToken,String(process.env.REFRESH_SECRET)) ;
        const userId=decoded.userId;

        const findUser= await pool.query("SELECT * FROM users WHERE id=$1",[userId]);
        if(findUser.rows.length===0){
            return res.status(401).json({
                message: "Invalid refresh token"
            })
        }
        const user=findUser.rows[0];
        if(user.refresh_token !== refreshToken){
            return res.status(401).json({
                message: "Invalid refresh token"
            })
        }

        const newAccessToken=jwt.sign(
            {
                userId:user.id,
                name:user.name
            },
            String(process.env.ACCESS_SECRET),
            {expiresIn:"25s"}
        )
        res.cookie("accesstoken",newAccessToken);
        res.json({
            message: "Access token refreshed successfully"
        })  
    }catch(err){
        console.error("Error refreshing access token", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
   
}