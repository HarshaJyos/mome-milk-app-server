import { Request, Response, NextFunction } from "express";
import { AdminModel } from "../models";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import bcrypt from "bcryptjs";
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
 * /api/admins:
 *   post:
 *     summary: Create an admin
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Invalid input
 */
const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new AdminModel({ email, passwordHash, role });
    await admin.save();
    logger.info(`Admin created: ${email}`, { requestId: req.requestId });
    res.status(201).json(admin);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Get admin details
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin details
 *       404:
 *         description: Admin not found
 */
const getAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const admin = await AdminModel.findById(id);
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }
    res.status(200).json(admin);
  } catch (error) {
    next(error);
  }
};

export { createAdmin, getAdmin };
