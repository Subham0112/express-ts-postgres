import { pool } from "./config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

pool.connect().then(()=>{
console.log("Connected to db")
}).catch((err)=>{
console.log("error connecting to db")
});


const createSuperAdmin =async ()=>{
    try{
const adminEmail=String(process.env.ADMIN_EMAIL);
const adminPassword=String(process.env.ADMIN_PASSWORD);
const adminName=String(process.env.ADMIN_NAME);

const hashAdminPassword=await bcrypt.hash(adminPassword,15);

await pool.query("INSERT INTO users (user_name,email,password,role) VALUES($1,$2,$3,$4)  ON CONFLICT (email) DO NOTHING ",[adminName,adminEmail,hashAdminPassword,'sudoadmin']);
  
    }catch(err){
        console.error("unable to create sudo admin")
        process.exit(1); 
    }finally{
        await pool.end();
    }
}
createSuperAdmin();