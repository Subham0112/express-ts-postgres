import express from "express";
import type { Express, Request, Response } from "express";
import {verifyToken} from "./middleware/verifyToken.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./config/db.js";
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

app.post("/register", async (req:Request, res:Response)=>{
    try {
        const {name,email,password} =req.body;
        const findUser=await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(findUser.rows.length>0){
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPassword= await bcrypt.hash(password,10);
        const result = await pool.query("INSERT INTO users (user_name, email,password) VALUES ($1, $2, $3) RETURNING *", [name, email,hashPassword]);
        res.status(201).json(result.rows[0]);
        console.log("User created successfully", result.rows[0]);
    } catch (err) {
        console.error("Error creating user", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post("/login",async (req:Request ,res:Response )=>{
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
            {expiresIn:"15m"}
        )
        const refreshToken=jwt.sign(
            {
                userId:user.id
            },
           String(process.env.REFRESH_SECRET),
            {expiresIn:"10d"}
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
   
})
app.get("/profile",verifyToken,async (req:Request,res:Response)=>{
    try{
        const userId=(req as any).user.userId;
        const result= await pool.query("SELECT id,user_name,email FROM users WHERE id=$1",[userId]);

        res.json({
            message: "User fetched successfully",
            user: result.rows[0]
        });
    }catch(err){
        console.error("Error fetching profile", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.listen(port,()=>{
    console.log("Server is running in port",port)
})