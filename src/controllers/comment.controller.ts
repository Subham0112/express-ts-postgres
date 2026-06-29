import type { Request,Response } from "express";
import prisma from "../config/prisma.js";


export const postComment = async (req:Request,res:Response)=>{
    const {comment,post_id}=req.body;
    const userId=req.user?.userId

    if (!userId) {
    return res.status(401).json({ message: "Authentication required" })
}
   
    if (!comment || !comment.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty" })
    }

    try{
            const findPost= await prisma.posts.findFirst({
        where:{id:Number(post_id)}
    })

    if(!findPost){
        return res.status(404).json({
            message:"Resource doesnot Exist"
        })
    }
    const postComment=await prisma.comments.create({
        data:{comment,user_id:Number(userId),post_id:Number(post_id)},
        include:{users:true,posts:true}
    })
   
    return res.status(200).json({
        message:"Comment Posted Successfully",
        comment:postComment
    })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }

}

export const getAllPostComments =async (req:Request,res:Response)=>{
    const {post_id}=req.params

   try {
        const findPost = await prisma.posts.findFirst({
            where: { id: Number(post_id) },
            select: { id: true }
        })
        if (!findPost) {
            return res.status(404).json({ message: "Resource Not Found" })
        }

        const getComments = await prisma.comments.findMany({
            where: { post_id: Number(post_id) },
            include: { users: true },
            orderBy: { created_at: "asc" }
        })

        return res.status(200).json({
            message: "Comments Fetched Successfully",
            comments: getComments
        })
    } catch (err) {
        console.log("Error fetching comments", err)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Authentication required" })
    }

    try {
        const findComment = await prisma.comments.findFirst({
            where: { id: Number(commentId) }
        })
        if (!findComment) {
            return res.status(404).json({ message: "Comments not found" })
        }

        const findPost = await prisma.posts.findFirst({
            where: { id: findComment.post_id },
            select: { user_id: true }
        })

        const isCommentOwner = Number(userId) === findComment.user_id
        const isPostOwner = !!findPost && Number(userId) === findPost.user_id

        if (!isCommentOwner && !isPostOwner) {
            return res.status(403).json({ message: "Not authorized to delete this comment" })
        }

        await prisma.comments.delete({
            where: { id: Number(commentId) }
        })
        res.status(200).json({ message: "Successfully Deleted Comments" })

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}