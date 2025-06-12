import { Request, Response, NextFunction } from "express";
import { VendorModel } from "../models";
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
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor profile
 *       404:
 *         description: Vendor not found
 */
const getVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      throw new NotFoundError("Vendor not found");
    }
    res.status(200).json(vendor);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               shop:
 *                 type: object
 *               deliverySlots:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated vendor profile
 *       400:
 *         description: Invalid input
 */
const updateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, shop, deliverySlots } = req.body;
    const vendor = await VendorModel.findByIdAndUpdate(
      id,
      { name, shop, deliverySlots, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!vendor) {
      throw new NotFoundError("Vendor not found");
    }
    logger.info(`Vendor updated: ${id}`, { requestId: req.requestId });
    res.status(200).json(vendor);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/vendors/{id}/approve:
 *   put:
 *     summary: Approve vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor approved
 *       400:
 *         description: Invalid vendor
 */
const approveVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const vendor = await VendorModel.findByIdAndUpdate(
      id,
      { status: "approved", updatedAt: new Date() },
      { new: true }
    );
    if (!vendor) {
      throw new NotFoundError("Vendor not found");
    }
    logger.info(`Vendor approved: ${id}`, { requestId: req.requestId });
    res.status(200).json(vendor);
  } catch (error) {
    next(error);
  }
};

export { getVendor, updateVendor, approveVendor };
