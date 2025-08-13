import express from "express";
import { chatBotReply } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/", chatBotReply);

export default router;
