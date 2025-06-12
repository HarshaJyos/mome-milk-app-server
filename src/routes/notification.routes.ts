import express from "express";
import {
  sendNotification,
  markAsRead,
  getNotifications,
} from "../controllers/notification.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateNotificationId } from "../middleware/notification.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */
router.post("/", verifyToken, restrictTo("admin", "vendor"), sendNotification);
router.put(
  "/:id/read",
  verifyToken,
  restrictTo("customer", "vendor"),
  validateNotificationId,
  markAsRead
);
router.get(
  "/",
  verifyToken,
  restrictTo("customer", "vendor"),
  getNotifications
);

export default router;
