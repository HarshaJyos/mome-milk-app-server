import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { ComplaintModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateComplaintId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid complaint ID");
  }
  const complaint = await ComplaintModel.findById(id);
  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }
  next();
};

export { validateComplaintId };
