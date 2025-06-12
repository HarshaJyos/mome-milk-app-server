import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { ProductModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateProductId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid product ID");
  }
  const product = await ProductModel.findById(id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  next();
};

const validateProductInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, category, price, unit } = req.body;
  if (!name || !category || !price || !unit) {
    throw new BadRequestError("Name, category, price, and unit are required");
  }
  next();
};

export { validateProductId, validateProductInput };
