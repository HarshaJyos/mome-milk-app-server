import { Request, Response, NextFunction } from "express";
import { ReviewModel } from "../models";
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
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
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
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Invalid rating
 */
const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { vendorId, rating, comment } = req.body;
    const review = new ReviewModel({
      customerId: req.user?.id,
      vendorId,
      rating,
      comment,
    });
    await review.save();
    logger.info(`Review created: ${vendorId}`, {
      reviewId: review._id,
      requestId: req.requestId,
    });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review details
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
const getReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await ReviewModel.findById(id).populate("customerId");
    if (!review) {
      throw new NotFoundError("Review not found");
    }
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export { createReview, getReview };
