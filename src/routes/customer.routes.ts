import express from "express";
import {
  getCustomer,
  updateCustomer,
  assignVendor,
} from "../controllers/customer.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateCustomerId } from "../middleware/customer.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
 */
router.get(
  "/:id",
  verifyToken,
  restrictTo("customer", "admin"),
  validateCustomerId,
  getCustomer
);
router.put(
  "/:id",
  verifyToken,
  restrictTo("customer"),
  validateCustomerId,
  updateCustomer
);
router.put(
  "/:id/vendor",
  verifyToken,
  restrictTo("customer"),
  validateCustomerId,
  assignVendor
);

export default router;
