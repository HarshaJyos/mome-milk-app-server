import { Request, Response, NextFunction } from "express";
import { BillingModel, DeliveryModel } from "../models";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import Razorpay from "razorpay";
import winston from "winston";

import dotenv from "dotenv";
dotenv.config();

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * @swagger
 * /api/billings:
 *   post:
 *     summary: Create a billing invoice
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               billingPeriod:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *     responses:
 *       201:
 *         description: Billing created
 *       400:
 *         description: Invalid input
 */
const createBilling = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { deliveryIds, billingPeriod } = req.body;
    const deliveries = await DeliveryModel.find({ _id: { $in: deliveryIds } });
    if (deliveries.length !== deliveryIds.length) {
      throw new BadRequestError("Invalid delivery IDs");
    }
    const totalAmount = deliveries.reduce(
      (sum, delivery) => sum + delivery.price * delivery.quantity,
      0
    );
    const billing = new BillingModel({
      customerId: req.user?.id,
      vendorId: deliveries[0].vendorId,
      deliveryIds,
      totalAmount,
      billingPeriod,
    });
    await billing.save();
    logger.info(`Billing created: ${billing._id}`, {
      requestId: req.requestId,
    });
    res.status(201).json(billing);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/billings/{id}/pay:
 *   post:
 *     summary: Initiate Razorpay payment
 *     tags: [Billings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing ID
 *     responses:
 *       200:
 *         description: Payment initiated
 *       400:
 *         description: Invalid billing
 */
const initiatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const billing = await BillingModel.findById(id);
    if (!billing) {
      throw new NotFoundError("Billing not found");
    }
    if (billing.status !== "pending") {
      throw new BadRequestError("Billing is not pending");
    }

    const order = await razorpay.orders.create({
      amount: billing.totalAmount * 100, // Razorpay
      currency: "INR",
      receipt: `billing-${billing._id}`,
    });

    billing.razorpayOrderId = order.id;
    await billing.save();
    logger.info(`Payment initiated for billing: ${billing._id}`, {
      orderId: order.id,
      requestId: req.requestId,
    });
    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/billings/{id}:
 *   get:
 *     summary: Get billing details
 *     tags: [Billings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Billing ID
 *     responses:
 *       200:
 *         description: Billing details
 *       404:
 *         description: Billing not found
 */
const getBilling = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const billing = await BillingModel.findById(id).populate("deliveryIds");
    if (!billing) {
      throw new NotFoundError("Billing not found");
    }
    res.status(200).json(billing);
  } catch (error) {
    next(error);
  }
};

export { createBilling, initiatePayment, getBilling };
