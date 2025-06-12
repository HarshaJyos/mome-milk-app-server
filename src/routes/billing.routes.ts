import express from "express";
import {
  createBilling,
  initiatePayment,
  getBilling,
} from "../controllers/billing.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateBillingId } from "../middleware/billing.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Billings
 *   description: Billing and payment management endpoints
 */
router.post("/", verifyToken, restrictTo("customer"), createBilling);
router.post(
  "/:id/pay",
  verifyToken,
  restrictTo("customer"),
  validateBillingId,
  initiatePayment
);
router.get(
  "/:id",
  verifyToken,
  restrictTo("customer", "vendor"),
  validateBillingId,
  getBilling
);

export default router;
