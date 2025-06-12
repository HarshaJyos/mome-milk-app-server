import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { BillingModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateBillingId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid billing ID");
  }
  const billing = await BillingModel.findById(id);
  if (!billing) {
    throw new NotFoundError("Billing not found");
  }
  next();
};

export { validateBillingId };
