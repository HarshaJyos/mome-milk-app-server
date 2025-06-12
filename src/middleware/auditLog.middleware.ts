import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "../errorMiddleware";
import { AuditLogModel } from "../models";
import { isValidObjectId } from "mongoose";

const validateAuditLogId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new BadRequestError("Invalid audit log ID");
  }
  const auditLog = await AuditLogModel.findById(id);
  if (!auditLog) {
    throw new NotFoundError("Audit log not found");
  }
  next();
};

export { validateAuditLogId };
