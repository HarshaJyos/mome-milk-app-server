import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { VendorModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateVendorId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid vendor ID");
  }
  const vendor = await VendorModel.findById(id);
  if (!vendor) {
    throw new NotFoundError("Vendor not found");
  }
  if (vendor.status !== "approved") {
    throw new BadRequestError("Vendor is not approved");
  }
  next();
};

export { validateVendorId };
