import { Request, Response, NextFunction } from "express";
import { AuditLogModel } from "../models";
import { NotFoundError } from "../errorMiddleware";
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
 * /api/audit_logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 */
const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auditLogs = await AuditLogModel.find().populate("performedBy");
    res.status(200).json(auditLogs);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/audit_logs/{id}:
 *   get:
 *     summary: Get audit log details
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit Log ID
 *     responses:
 *       200:
 *         description: Audit log details
 *       404:
 *         description: Audit log not found
 */
const getAuditLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const auditLog = await AuditLogModel.findById(id).populate("performedBy");
    if (!auditLog) {
      throw new NotFoundError("Audit log not found");
    }
    res.status(200).json(auditLog);
  } catch (error) {
    next(error);
  }
};

export { getAuditLogs, getAuditLog };
