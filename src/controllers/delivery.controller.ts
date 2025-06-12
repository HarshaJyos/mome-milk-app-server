import { Request, Response, NextFunction } from "express";
import { DeliveryModel, ProductModel } from "../models";
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
 * /api/deliveries:
 *   post:
 *     summary: Schedule a delivery
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery scheduled
 *       400:
 *         description: Invalid input
 */
const scheduleDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity, deliveryDate, timeSlot } = req.body;
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const price = product.promotions?.discountPrice || product.price;
    const delivery = new DeliveryModel({
      customerId: req.user?.id,
      vendorId: product.vendorId,
      productId,
      quantity,
      price,
      deliveryDate,
      timeSlot,
    });
    await delivery.save();
    logger.info(`Delivery scheduled: ${delivery._id}`, {
      requestId: req.requestId,
    });
    res.status(201).json(delivery);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get delivery details
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery ID
 *     responses:
 *       200:
 *         description: Delivery details
 *       404:
 *         description: Delivery not found
 */
const getDelivery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const delivery = await DeliveryModel.findById(id).populate("productId");
    if (!delivery) {
      throw new NotFoundError("Delivery not found");
    }
    res.status(200).json(delivery);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/deliveries/{id}/status:
 *   put:
 *     summary: Update delivery status
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, canceled, skipped]
 *     responses:
 *       200:
 *         description: Delivery status updated
 *       400:
 *         description: Invalid status
 */
const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const delivery = await DeliveryModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!delivery) {
      throw new NotFoundError("Delivery not found");
    }
    logger.info(`Delivery status updated: ${id}`, {
      status,
      requestId: req.requestId,
    });
    res.status(200).json(delivery);
  } catch (error) {
    next(error);
  }
};

export { scheduleDelivery, getDelivery, updateDeliveryStatus };
