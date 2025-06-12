import express from "express";
import {
  getVendor,
  updateVendor,
  approveVendor,
} from "../controllers/vendor.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateVendorId } from "../middleware/vendor.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management endpoints
 */
router.get(
  "/:id",
  verifyToken,
  restrictTo("vendor", "admin"),
  validateVendorId,
  getVendor
);
router.put(
  "/:id",
  verifyToken,
  restrictTo("vendor"),
  validateVendorId,
  updateVendor
);
router.put(
  "/:id/approve",
  verifyToken,
  restrictTo("admin"),
  validateVendorId,
  approveVendor
);

export default router;
