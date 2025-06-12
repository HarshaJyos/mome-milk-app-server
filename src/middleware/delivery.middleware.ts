import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { DeliveryModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateDeliveryId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid delivery ID");
  }
  const delivery = await DeliveryModel.findById(id);
  if (!delivery) {
    throw new NotFoundError("Delivery not found");
  }
  next();
};

export { validateDeliveryId };
