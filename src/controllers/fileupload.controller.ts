import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
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
    const user_id=Number(userId)

    const fileUrl=`http://localhost:3000/uploads/${filename}`
    try{
        const mediaCreate=await prisma.media.create({
            data:{user_id:user_id,filename,file_url:fileUrl},
        })
           res.status(200).json({
            message:"File uploaded succesfully",
            file:mediaCreate  
    })
    }catch(err){
        console.log(err)
    }
 

}

export const deleteFile=async (req:Request, res:Response)=>{
    const {id}=req.params
    try{
        const findFile=await prisma.media.findFirst({
            where:{media_id:Number(id)}
        })
        if(!findFile){
            return res.status(404).json({
                message:"File Not Found"
            })
        }
        const {filename} =findFile;
        await prisma.media.delete({
            where:{media_id:Number(id)}
        })
        
        const filePath = path.join("src/uploads", filename ?? "")
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting from Local:", err)
        })
        res.status(200).json({
            message:"File Deleted Successfully"
        })
    }catch(err){
        console.log('Error deleting file',err)
        res.status(500).json({
            message:'Internal Server Error'
        })
    }

}