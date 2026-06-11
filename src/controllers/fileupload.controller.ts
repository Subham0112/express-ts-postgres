import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import fs from "fs"
import path from "path";

export const uploadFile=async(req:Request,res:Response)=>{
    console.log(req.file);
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" })
        return
    }
    const {filename}=req.file;
    const {userId}=req.body

    const fileUrl=`http://localhost:3000/uploads/${filename}`
    try{
        const result=await pool.query("INSERT INTO media (user_id,filename,file_url) VALUES ($1,$2,$3) RETURNING *",[userId,filename,fileUrl])
           res.status(200).json({
            message:"Succesfully file uploaded",
            file:result.rows[0]  
    })
    }catch(err){
        console.log(err)
    }
 

}

export const deleteFile=async (req:Request, res:Response)=>{
    const {id}=req.params
    try{
        const findFile=await pool.query("SELECT * FROM media WHERE media_id=$1 ",[id])
        if(findFile.rows.length===0){
            return res.status(404).json({
                message:"File Not Found"
            })
        }
        const {filename} =findFile.rows[0];
        const deleteFile= await pool.query("DELETE FROM media WHERE media_id=$1",[id])
        
        const filePath = path.join("src/uploads", filename)
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting from Local:", err)
        })
        res.status(200).json({
            message:"Deleted Media Successfully"
        })
    }catch(err){
        console.log('Error deleting file',err)
        res.status(500).json({
            message:'Internal Server Error'
        })
    }

}