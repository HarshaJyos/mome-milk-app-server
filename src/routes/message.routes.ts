import express from "express";
import {
  sendMessage,
  getConversation,
} from "../controllers/message.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging management endpoints
 */
router.post("/", verifyToken, restrictTo("customer", "vendor"), sendMessage);
router.get("/", verifyToken, restrictTo("customer", "vendor"), getConversation);

export default router;
