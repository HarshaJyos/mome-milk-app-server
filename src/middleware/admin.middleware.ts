import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { AdminModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateAdminId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid admin ID");
  }
  const admin = await AdminModel.findById(id);
  if (!admin) {
    throw new NotFoundError("Admin not found");
  }
  next();
};

export { validateAdminId };
