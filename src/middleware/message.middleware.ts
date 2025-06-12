import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { MessageModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateMessageId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid message ID");
  }
  const message = await MessageModel.findById(id);
  if (!message) {
    throw new NotFoundError("Message not found");
  }
  next();
};

export { validateMessageId };
