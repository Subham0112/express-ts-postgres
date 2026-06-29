import { Router } from "express";

import { deleteChat, getConversations, getMessages, sendMessage } from "../controllers/message.controller.js";
import {verifyToken} from "../middleware/verifyToken.js";


export const messageRouter = Router()


messageRouter.post("/message",verifyToken,sendMessage)
messageRouter.get("/message/:otherUserId",verifyToken,getMessages)
messageRouter.get("/get-conversation",verifyToken,getConversations)
messageRouter.delete("/delete-message/:chatId",verifyToken,deleteChat)