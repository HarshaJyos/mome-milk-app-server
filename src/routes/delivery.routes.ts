import express from "express";
import {
  scheduleDelivery,
  getDelivery,
  updateDeliveryStatus,
} from "../controllers/delivery.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateDeliveryId } from "../middleware/delivery.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deliveries
 *   description: Delivery management endpoints
 */
router.post("/", verifyToken, restrictTo("customer"), scheduleDelivery);
router.get(
  "/:id",
  verifyToken,
  restrictTo("customer", "vendor"),
  validateDeliveryId,
  getDelivery
);
router.put(
  "/:id/status",
  verifyToken,
  restrictTo("vendor"),
  validateDeliveryId,
  updateDeliveryStatus
);

export default router;
