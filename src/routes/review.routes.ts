import express from "express";
import { createReview, getReview } from "../controllers/review.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateReviewId } from "../middleware/review.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 */
router.post("/", verifyToken, restrictTo("customer"), createReview);
router.get("/:id", validateReviewId, getReview);

export default router;
