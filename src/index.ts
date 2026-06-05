import express from "express";
import type { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
dotenv.config();



const app:Express= express();
app.use(express.json());

const port = Number(process.env.PORT) || 3000;
pool.connect().then(()=>{
    console.log("successfully connected to db ")
}).catch((err)=>{
    console.log("Error connecting to database", err)
})

app.post("/users", async (req:Request, res:Response)=>{
    try {
        const {name,email} =req.body;
        const result = await pool.query("INSERT INTO users (user_name, email) VALUES ($1, $2) RETURNING *", [name, email]);
        res.status(201).json(result.rows[0]);
        console.log("User created successfully", result.rows[0]);
    } catch (err) {
        console.error("Error creating user", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get("/users",async (req:Request ,res:Response )=>{
    try{
    const result=await pool.query(`SELECT * FROM users`);
    res.status(201).json(result.rows);
    console.log("Users fetched successfully", result.rows);
    }catch(err){
        console.error("Error fetching users", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
   
})

app.get("/users/:id",async (req:Request , res:Response)=>{
    try{
    const {id}=req.params
    
    const result= await pool.query(`SELECT * FROM users WHERE id=$1 `,[id]);
    res.status(200).json(result.rows);
    console.log(`Fetched Users with id:${id}`,result.rows)
    }catch (err){
         console.error("Error fetching users", err);
         res.status(500).json({error: "Internal Server Error"})
    }
    
})

app.put('/users/:id',async (req:Request,res:Response)=>{
try{
    const {id}=req.params;
   const {updateName,updateEmail}=req.body; 

    const result=await pool.query(`UPDATE users SET user_name=$1,email=$2 WHERE id=$3 RETURNING *`,[updateName , updateEmail, id])
    res.status(200).json(result.rows)
    console.log("edited users:",result.rows)
}catch (err){
    console.error("Error updating Users:",err)
    res.status(500).json({
        error:"Internal Server Error"
    })
}
})

app.delete('/users/:id',async (req:Request,res:Response)=>{
try{
    const {id}=req.params;
    
    const result=await pool.query(`DELETE FROM users WHERE id=$1 RETURNING *`,[id])
    res.status(200).json(result.rows)
    console.log("Succesfully deleted users:",result.rows)
}catch (err){
    console.error("Error deleting Users:",err)
    res.status(500).json({
        error:"Internal Server Error"
    })
}
})

app.patch('/users/:id',async (req:Request, res:Response)=>{
try{
    const {id}=req.params;
   const {updateName,updateEmail}=req.body; 

    const result=await pool.query(`UPDATE users SET
         user_name=COALESCE($1,user_name),email=COALESCE($2,email) WHERE id=$3 RETURNING *`,[updateName , updateEmail, id])
    res.status(200).json(result.rows)
    console.log("edited users:",result.rows)
}catch (err){
    console.error("Error updating Users:",err)
    res.status(500).json({
        error:"Internal Server Error"
    })
}
})

app.listen(port,()=>{
    console.log("Server is running in port",port)
})