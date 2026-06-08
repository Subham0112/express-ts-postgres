import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";


const transporter=nodemailer.createTransport({
    host: String(process.env.EMAIL_HOST),
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth:{
        user: String(process.env.EMAIL_USER),
        pass: String(process.env.EMAIL_PASS)
    }
})


export const register = async (req:Request, res:Response)=>{
    try {
        const {name,email,password,role} =req.body;
        const findUser=await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(findUser.rows.length>0){
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPassword= await bcrypt.hash(password,10);
        const result = await pool.query("INSERT INTO users (user_name, email,password,role) VALUES ($1, $2, $3,$4) RETURNING id,user_name,email", [name, email,hashPassword,role]);
        res.status(201).json(
            {message:"User Registered Successfully",
                user:result.rows[0]
            })
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
            return res.status(401).json({
                error:"Invalid email or password"
            })
        }

        const accessToken=jwt.sign(
            {
                userId:user.id,
                name:user.name,
                role:user.role
            },
            String(process.env.ACCESS_SECRET),
            {expiresIn:"5m"}
        )
        const refreshToken=jwt.sign(
            {
                userId:user.id,
                role:user.role
            },
           String(process.env.REFRESH_SECRET),
            {expiresIn:"10m"}
        )
     
        await pool.query("UPDATE users SET refresh_token=$1 WHERE id=$2",[refreshToken,user.id]);

        res.cookie("accesstoken",accessToken)
        res.cookie("refreshtoken",refreshToken)
          res.json({
          message: "Login successful",
          user: { id: user.id, email: user.email, role:user.role },
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
                name:user.name,
                role:user.role
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

export const forgetPassword =async (req:Request,res:Response)=>{
    try{
        const {email}=req.body;
        const findEmail= await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(findEmail.rows.length===0){
            return res.status(404).json({
                message: "Email not found"
            })
        }

        const otp=Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt= new Date(Date.now() + 2* 60* 1000);

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
                message: "Password reset otp sent on email",
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
}

export const verifyOtp = async (req:Request,res:Response)=>{
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
}

export const resetPassword=async (req:Request,res:Response)=>{
    try{
        const {newPassword, email}=req.body;
        const hashedNewPassword=await bcrypt.hash(newPassword,15);
        const changePassword=await pool.query("UPDATE users SET password=$1 WHERE email=$2 RETURNING id,user_name,email",[hashedNewPassword,email])
        res.status(200).json({
            message:"Password Updated Successfully",
            user:changePassword.rows
        })
        

    }catch(err){
        res.status(500).json({
            error:"Internal Server Error"
        })
    }
};

export const resendOtp=async (req:Request,res:Response)=>{
    try{
   const {email}=req.body;
    const checkOtp= await pool.query("SELECT * FROM otp_table WHERE email=$1",[email])
    if(checkOtp.rows.length===0){
        return res.status(404).json({
                message: "Invalid email"
            })
    }
        const otp=Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt= new Date(Date.now() + 2* 60 *1000);
        await pool.query("UPDATE otp_table SET otp=$1, expires_at=$2 WHERE email=$3",[otp,expiresAt,email]);
         
           try{
            const mailInfo= await transporter.sendMail({
                from: String(process.env.EMAIL_USER),
                to: email,
                subject: "OTP resend Request",
                html: `<p>You requested a password reset. Please use the following OTP to reset your password:</p><h2>${otp}</h2>`
            })
            res.status(200).json({
                message: "otp send successfully",
            })
        }catch(err){
            console.error("Error sending otp", err);
            return res.status(500).json({
                message: "Error sending otp"
            })
        }
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
 
        }

export const passwordChange =async (req:Request,res:Response)=>{
    try{
        const {email,password,changePassword}=req.body;
    const checkUser=await pool.query("SELECT * FROM users WHERE email=$1",[email])
    if (checkUser.rows.length===0){
        return res.status(404).json({
            error:"Invalid Email or password "
        })
    }
    const userData=checkUser.rows[0];
   const matchPassword= await bcrypt.compare(password,userData.password)
        if(!matchPassword){
           return res.status(400).json({
            error:"Invalid email or password"
           })
        }
    const matchNewPassword=await bcrypt.compare(changePassword,userData.password)
    if(matchNewPassword){
        return res.status(400).json({
            error:"New password and Old password are same "
        })
    }

    const hashedNewPassword=await bcrypt.hash(changePassword,15);

    const updatePassword=await pool.query("UPDATE users SET password=$1 WHERE email=$2 RETURNING id,user_name,email",[hashedNewPassword,email]);
    return res.status(200).json({
        message:"Password Changed Successfully",
        user:updatePassword.rows
    })
    }catch (err){
        res.status(500).json({
            message:"Internal Server Error"
        })
    }

}

export const logout= async (req:Request,res:Response)=>{
    res.clearCookie("refreshtoken");
    res.clearCookie("accesstoken")
    res.status(200).json({message:"Logged out successfully"})
}

export const getAllUsers = async(req:Request,res:Response)=>{
    try{
        const result =await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
    }catch(err){
        res.status(500).json({error:"Internal Server Error"})
    }
    
}

export const deleteUser = async(req:Request,res:Response)=>{
    try{
        const { id }=req.params;
        const requestedId=req.user?.userId;
        const requestedRole=req.user?.role;

        if(requestedRole==="sudoadmin"){
            await pool.query("DELETE FROM users WHERE id=$1 ",[id])
            return res.status(200).json({
                message:"User deleted successfully"
            })
        }
        if(requestedRole==="admin"){
            const targetedUsers= await pool.query("SELECT * FROM users WHERE id=$1",[id]);
            if(targetedUsers.rows.length===0){
                return res.status(404).json({
                    error:"Invalid user id "
                })
            }
            if(targetedUsers.rows[0].role!=="user"){
                return res.status(403).json({
                    error:"Admin can delete only regular users"
                })
            }
            await pool.query("DELETE FROM users WHERE id=$1",[id]);
            return res.status(200).json({
                message:"User deleted Successfully"
            })
        }

        if(String(requestedId)!==String(id)){
            return res.status(403).json({
                error:"Users can delete their own account"
            })
        }
        await pool.query("DELETE FROM users WHERE id=$1",[id]);
        return res.status(200).json({
            message:"Successfully deleted users."
        })

    }catch(err){
        return res.status(500).json({
            error:"Internal Server Error"
        })
    }
}