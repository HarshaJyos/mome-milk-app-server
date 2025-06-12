import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errorMiddleware";

const restrictTo = (...roles: ("customer" | "vendor" | "admin")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to perform this action"
      );
    }
    next();
  };
};

export { restrictTo };
