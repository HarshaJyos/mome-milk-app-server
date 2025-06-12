import express from "express";
import {
  createComplaint,
  getComplaint,
  resolveComplaint,
} from "../controllers/complaint.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateComplaintId } from "../middleware/complaint.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management endpoints
 */
router.post("/", verifyToken, restrictTo("customer"), createComplaint);
router.get(
  "/:id",
  verifyToken,
  restrictTo("customer", "vendor", "admin"),
  validateComplaintId,
  getComplaint
);
router.put(
  "/:id/resolve",
  verifyToken,
  restrictTo("admin"),
  validateComplaintId,
  resolveComplaint
);

export default router;
