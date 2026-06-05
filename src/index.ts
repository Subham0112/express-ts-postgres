import express from "express";
import type { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
dotenv.config();

const app:Express= express();
const port = Number(process.env.PORT) || 3000;
pool.connect().then(()=>{
    console.log("successfully connected to db ")
}).catch((err)=>{
    console.log("Error connecting to database", err)
})



app.get("/",(req:Request ,res:Response )=>{
res.send ("Express Setup with ts and typescript")
})



app.listen(port,()=>{
    console.log("Server is running in port",port)
})