import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { NotificationModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateNotificationId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid notification ID");
  }
  const notification = await NotificationModel.findById(id);
  if (!notification) {
    throw new NotFoundError("Notification not found");
  }
  next();
};

export { validateNotificationId };
