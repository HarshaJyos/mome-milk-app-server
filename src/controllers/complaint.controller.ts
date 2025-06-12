import { Request, Response, NextFunction } from "express";
import { ComplaintModel } from "../models";
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
 * /api/complaints:
 *   post:
 *     summary: Create a complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorId:
 *                 type: string
 *               deliveryId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Complaint created
 *       400:
 *         description: Invalid input
 */
const createComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { vendorId, deliveryId, description } = req.body;
    const complaint = new ComplaintModel({
      customerId: req.user?.id,
      vendorId,
      deliveryId,
      description,
    });
    await complaint.save();
    logger.info(`Complaint created: ${complaint._id}`, {
      requestId: req.requestId,
    });
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get complaint details
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 */
const getComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const complaint = await ComplaintModel.findById(id).populate(
      "customerId",
      "vendorId"
    );
    if (!complaint) {
      throw new NotFoundError("Complaint not found");
    }
    res.status(200).json(complaint);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/complaints/{id}/resolve:
 *   put:
 *     summary: Resolve complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint resolved
 *       400:
 *         description: Invalid input
 */
const resolveComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    const complaint = await ComplaintModel.findByIdAndUpdate(
      id,
      { status: "resolved", resolution, updatedAt: new Date() },
      { new: true }
    );
    if (!complaint) {
      throw new NotFoundError("Complaint not found");
    }
    logger.info(`Complaint resolved: ${id}`, { requestId: req.requestId });
    res.status(200).json(complaint);
  } catch (error) {
    next(error);
  }
};

export { createComplaint, getComplaint, resolveComplaint };
