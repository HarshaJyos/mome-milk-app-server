import { Request, Response, NextFunction } from "express";
import { MessageModel } from "../models";
import { BadRequestError } from "../errorMiddleware";
import winston from "winston";
import { isValidObjectId } from "mongoose";

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Invalid input
 */
const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receiverId, message } = req.body;
    const messageObj = new MessageModel({
      senderId: req.user?.id,
      receiverId,
      message,
    });
    await messageObj.save();
    logger.info(`Message sent: ${messageObj._id}`, {
      requestId: req.requestId,
    });
    res.status(201).json(messageObj);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get conversation history
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: receiverId
 *         name: receiverId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Receiver ID
 *     responses:
 *       200:
 *         description: Conversation history
 *       400:
 *         description: Invalid receiver ID
 */
const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiverId } = req.query;
    if (!isValidObjectId(receiverId as string)) {
      throw new BadRequestError("Invalid receiver ID");
    }
    const messages = await MessageModel.find({
      $or: [
        { senderId: req.user?.id, receiverId: receiverId },
        { senderId: receiverId, receiverId: req.user?.id },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export { sendMessage, getConversation };
