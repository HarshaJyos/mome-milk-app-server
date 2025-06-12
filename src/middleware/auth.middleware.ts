import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errorMiddleware";
import { CustomerModel, VendorModel, AdminModel } from "../models";
import winston from "winston";

// Extend Express Request interface to include requestId and user
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        id: string;
        role: "customer" | "vendor" | "admin";
        mobileNumber?: string;
        email?: string;
      };
    }
  }
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) {
    logger.warn("No token provided", { requestId: req.requestId });
    throw new UnauthorizedError("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string;
      role: "customer" | "vendor" | "admin";
    };
    
    let user = null;
    if (decoded.role === "customer") {
      user = await CustomerModel.findById(decoded.id).select("-__v");
    } else if (decoded.role === "vendor") {
      user = await VendorModel.findById(decoded.id).select("-__v");
    } else if (decoded.role === "admin") {
      user = await AdminModel.findById(decoded.id).select("-passwordHash -__v");
    }

    if (!user) {
      logger.warn(`User not found for ID: ${decoded.id}`, {
        requestId: req.requestId,
      });
      throw new UnauthorizedError("User not found");
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      mobileNumber: (user as any).mobileNumber || undefined,
      email: (user as any).email || undefined,
    };
    logger.info(`Token verified for user: ${decoded.id}`, {
      role: decoded.role,
      requestId: req.requestId,
    });
    next();
  } catch (error) {
    logger.error("Token verification failed", {
      error,
      requestId: req.requestId,
    });
    throw new UnauthorizedError("Invalid token");
  }
};

export { verifyToken };
