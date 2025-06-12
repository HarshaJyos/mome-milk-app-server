import { Request, Response, NextFunction } from "express";
import { NotificationModel } from "../models";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import winston from "winston";

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
 * /api/notifications:
 *   post:
 *     summary: Send notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *               recipientType:
 *                 type: string
 *               type:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification sent
 *       400:
 *         description: Invalid input
 */
const sendNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipientId, recipientType, type, message } = req.body;
    const notification = new NotificationModel({
      recipientId,
      recipientType,
      type,
      message,
    });

    await notification.save();
    logger.info(`Notification sent: ${notification._id}`, {
      requestId: req.requestId,
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    logger.info(`Notification marked as read: ${id}`, {
      requestId: req.requestId,
    });
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await NotificationModel.find({
      recipientId: req.user?.id,
      recipientType: req.user?.role,
    });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export { sendNotification, markAsRead, getNotifications };
