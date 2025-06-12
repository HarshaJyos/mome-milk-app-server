import { Request, Response, NextFunction } from "express";
import { CustomerModel, VendorModel } from "../models";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
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
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 */
const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customer = await CustomerModel.findById(id).populate("vendorId");
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: object
 *               deliveryPreferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Updated customer profile
 *       400:
 *         description: Invalid input
 */
const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, email, address, deliveryPreferences } = req.body;
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { name, email, address, deliveryPreferences, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    logger.info(`Customer updated: ${id}`, { requestId: req.requestId });
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers/{id}/vendor:
 *   put:
 *     summary: Assign vendor to customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor assigned
 *       400:
 *         description: Invalid vendor ID
 */
const assignVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.body;
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor || vendor.status !== "approved") {
      throw new BadRequestError("Invalid or unapproved vendor");
    }
    const customer = await CustomerModel.findByIdAndUpdate(
      id,
      { vendorId, updatedAt: new Date() },
      { new: true }
    );
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    logger.info(`Vendor assigned to customer: ${id}`, {
      vendorId,
      requestId: req.requestId,
    });
    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

export { getCustomer, updateCustomer, assignVendor };
