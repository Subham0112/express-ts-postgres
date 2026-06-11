import express from "express";
import type { Express, Request, Response } from "express";
import {verifyToken} from "./middleware/verifyToken.js";
import cors from "cors";
import dotenv from "dotenv";
import upload from "./multer.js";
import cookieParser from "cookie-parser";
import {register,login,getUser,refreshToken,forgetPassword,verifyOtp,resetPassword,getAllUsers, logout, resendOtp, passwordChange,deleteUser,logoutFromAll} from "./controllers/login.controller.js";
import { uploadFile,deleteFile } from "./controllers/fileupload.controller.js";
import path from "path";
import { fileURLToPath } from "url";


import { pool } from "./config/db.js";
import {authSudoAdmin, authAdmin,authAdminOrSudoadmin} from './middleware/auth.js';
import bcrypt from "bcryptjs";
dotenv.config();

const app:Express= express();

app.use(express.json());
app.use(cors({
    origin:true,
    credentials:true,
}));
app.use(cookieParser())

const port = Number(process.env.PORT) || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../src/uploads")))

pool.connect().then(()=>{
    console.log("successfully connected to db ")
}).catch((err)=>{
    console.log("Error connecting to database", err)
})




app.post("/register", register);
app.post("/login", login);
app.get("/profile", verifyToken, getUser);
app.post("/refresh-token", refreshToken);
app.post("/upload-file",upload.single("file"),uploadFile)
app.delete("/delete-file/:id",deleteFile)
app.post("/forget-password",forgetPassword);
app.post('/verify-otp',verifyOtp);
app.patch('/reset-password',resetPassword);
app.patch('/resend-otp',resendOtp)
app.patch("/change-password",passwordChange)
app.post("/logout",logout);
app.get("/getAllUsers",verifyToken, authAdminOrSudoadmin ,getAllUsers);
app.delete("/deleteUser/:id",verifyToken,deleteUser)
app.patch("/logout-from-all",verifyToken, logoutFromAll)


app.listen(port,()=>{
    console.log("Server is running in port",port)
})