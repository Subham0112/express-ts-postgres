import express from "express";
import type { Express} from "express";
import "reflect-metadata";
import { AppDataSource } from "./config/data-source.js";
import { createServer } from "http"; 
import { Server } from "socket.io";  
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/auth.route.js";
import { postRouter } from "./routes/posts.route.js";
import path from "path";
import { fileURLToPath } from "url";
import { messageRouter } from "./routes/message.route.js";
dotenv.config();

const app:Express= express();
 const httpServer=createServer(app)

 const io= new Server(httpServer,{
    cors:{
        origin:true,
        credentials:true
    }
 })

 
const userSocketMap = new Map<number, string>()

io.on("connection", (socket) => {
  console.log("User Connected", socket.id)

  socket.on("join", (userId: number) => {
    socket.join(`user_${userId}`)
    userSocketMap.set(Number(userId), socket.id)  // ← track socket
    console.log(`User ${userId} joined the room`)
  })

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, message } = data
    try {
      io.to(`user_${receiverId}`).emit("receive_message", {
        sender_id: senderId,
        receiver_id: receiverId,
        messages: message,
        created_at: new Date(),
        id: Date.now(),
        is_read: false,
      })
    } catch (err) {
      socket.emit("error", { message: "Message failed" })
    }
  })

  socket.on("typing", (data) => {
    const { receiverId, senderId } = data
    io.to(`user_${receiverId}`).emit("user_typing", { senderId })
  })

  socket.on("stop_typing", (data) => {
    const { receiverId, senderId } = data
    io.to(`user_${receiverId}`).emit("user_stop_typing", { senderId })
  })

 socket.on("messages_read", (data) => {
  console.log("SERVER messages_read — data:", data)
  const senderSocketId = userSocketMap.get(Number(data.senderId))
  console.log("senderSocketId found:", senderSocketId ?? "NOT IN MAP")
  console.log("userSocketMap contents:", [...userSocketMap.entries()])
  if (senderSocketId) {
    io.to(senderSocketId).emit("messages_read", { readerId: data.readerId })
    console.log("Emitted messages_read to:", senderSocketId)
  }
})

  socket.on("disconnect", () => {
    for (const [userId, sid] of userSocketMap.entries()) {
      if (sid === socket.id) {
        userSocketMap.delete(userId)
        break
      }
    }
    console.log("User disconnected:", socket.id)
  })
})

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
app.use("/",userRouter)
app.use("/",postRouter)
app.use("/",messageRouter)

AppDataSource.initialize()
  .then(() => {
    console.log("Database Connected");

    httpServer.listen(port, () => {
      console.log("Server running");
    });
  })
  .catch((err) => {
    console.error(err);
  });