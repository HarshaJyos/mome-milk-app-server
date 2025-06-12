import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { ReviewModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateReviewId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid review ID");
  }
  const review = await ReviewModel.findById(id);
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  next();
};

export { validateReviewId };
