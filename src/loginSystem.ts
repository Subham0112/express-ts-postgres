import express from "express";
import type { Express, Request, Response } from "express";
import {verifyToken} from "./middleware/verifyToken.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {register,login,getUser,refreshToken,forgetPassword,verifyOtp,resetPassword,getAllUsers, logout} from "./controllers/login.controller.js";
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



app.post("/register", register);
app.post("/login", login);
app.get("/profile", verifyToken, getUser);
app.post("/refresh-token", refreshToken);
app.post("/forget-password",forgetPassword);
app.post('/verify-otp',verifyOtp);
app.patch('/reset-password',resetPassword)
app.post("/logout",logout)
app.get("/getAllUsers",getAllUsers)


app.listen(port,()=>{
    console.log("Server is running in port",port)
})