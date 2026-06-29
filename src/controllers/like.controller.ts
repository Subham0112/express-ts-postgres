import type { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const toggleLike=async (req:Request, res:Response)=>{
        const {postId}=req.params;
        const userId =req.user?.userId
        try{
            const findLiked = await prisma.likes.findUnique({
            where:{user_id_post_id:{user_id:Number(userId),post_id:Number(postId)}}
        })
        if(findLiked){
            await prisma.likes.delete({
            where: { user_id_post_id: { user_id: Number(userId), post_id: Number(postId) } }
        })
        return res.status(200).json({
            liked:false
        })
     }else{
        await prisma.likes.create({
           data:{user_id:Number(userId),post_id:Number(postId)}
        })
        return res.status(200).json({
            liked:true
        })
    }
        }catch(err){
            return res.status(500).json({
                message:"Internal Server Error"
            })
        }

     }