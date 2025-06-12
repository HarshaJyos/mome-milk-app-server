import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { CustomerModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateCustomerId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid customer ID");
  }
  const customer = await CustomerModel.findById(id);
  if (!customer) {
    throw new NotFoundError("Customer not found");
  }
  next();
};

export { validateCustomerId };
