import express from "express";
import type { Express, Request, Response } from "express";
import {verifyToken} from "./middleware/verifyToken.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import {register,login,getUser,refreshToken} from "./controllers/login.controller.js";
import { pool } from "./config/db.js";
import bcrypt from "bcryptjs";
dotenv.config();

const app:Express= express();
app.use(express.json());
app.use(cookieParser())

const port = Number(process.env.PORT) || 3000;

pool.connect().then(()=>{
    console.log("successfully connected to db ")
}).catch((err)=>{
    console.log("Error connecting to database", err)
})

const transporter=nodemailer.createTransport({
    host: String(process.env.EMAIL_HOST),
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth:{
        user: String(process.env.EMAIL_USER),
        pass: String(process.env.EMAIL_PASS)
    }
})

app.post("/register", register)

app.post("/login", login)
app.get("/profile", verifyToken, getUser)

app.post("/refresh-token", refreshToken)


app.post("/forget-password",async (req:Request,res:Response)=>{
    try{
        const {email}=req.body;
        const findEmail= await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(findEmail.rows.length===0){
            return res.status(404).json({
                message: "Email not found"
            })
        }

        const otp=Math.floor(100000 + Math.random() * 90000).toString();
        const expiresAt= new Date(Date.now() + 10 * 60 * 1000);

        await pool.query("INSERT INTO otp_table (email, otp, expires_at) VALUES ($1, $2, $3)",[email,otp,expiresAt]);

        try{
            const mailInfo= await transporter.sendMail({
                from: String(process.env.EMAIL_USER),
                to: email,
                subject: "Password Reset Request",
                text: "You requested a password reset. Please use the following OTP to reset your password",
                html: `<p>You requested a password reset. Please use the following OTP to reset your password:</p><h2>${otp}</h2>`
            })
            res.status(200).json({
                message: "Password reset email sent",
            })
        }catch(err){
            console.error("Error sending email", err);
            return res.status(500).json({
                message: "Error sending email"
            })
        }
            
    }catch(err){
        console.error("Error in forget password", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post('/verify-otp',async (req:Request,res:Response)=>{
    try{
        const {otp,email}=req.body;
        const findOtp= await pool.query("SELECT * FROM otp_table WHERE otp=$1 AND email=$2",[otp,email]);
        if(findOtp.rows.length===0){
            return res.status(404).json({
                message: "Invalid OTP"
            })
        }
        const otpData=findOtp.rows[0];
        if(new Date() > new Date(otpData.expires_at)){
            return res.status(400).json({
                message: "OTP expired"
            })
        }
        res.status(200).json({
            message: "OTP verified successfully"
        })
    }catch(err){
        console.error("Error in verify OTP", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.patch('/reset-password',async (req:Request,res:Response)=>{
    try{
        const {newPassword, email}=req.body;
        const hashedNewPassword=await bcrypt.hash(newPassword,15);
        const changePassword=await pool.query("UPDATE users SET password=$1 WHERE email=$2 RETURNING *",[hashedNewPassword,email])
        res.status(200).json({message:"Password Updated Successfully"})
        res.status(200).json(changePassword.rows)

    }catch(err){
        res.status(500).json({
            error:"Internal Server Error"
        })
    }
})

app.get("/getAllUsers", async(req:Request,res:Response)=>{
    try{
        const result =await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
    }catch(err){
        res.status(500).json({error:"Internal Server Error"})
    }
    
})


app.listen(port,()=>{
    console.log("Server is running in port",port)
})