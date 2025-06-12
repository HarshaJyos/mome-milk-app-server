import express from "express";
import { getAuditLogs, getAuditLog } from "../controllers/auditLog.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateAuditLogId } from "../middleware/auditLog.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Audit log management endpoints
 */
router.get("/", verifyToken, restrictTo("admin"), getAuditLogs);
router.get(
  "/:id",
  verifyToken,
  restrictTo("admin"),
  validateAuditLogId,
  getAuditLog
);

export default router;
