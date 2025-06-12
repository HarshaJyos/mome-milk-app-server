import express from "express";
import rateLimit from "express-rate-limit";
import {
  signupCustomer,
  signupVendor,
  signupAdmin,
  verifyOtp,
  loginCustomer,
  loginVendor,
  loginAdmin,
  verifyLoginOtp,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";

const router = express.Router();

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
router.post("/signup/customer", authLimiter, signupCustomer);
router.post("/signup/vendor", authLimiter, signupVendor);
router.post("/signup/admin", authLimiter, signupAdmin);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/login/customer", authLimiter, loginCustomer);
router.post("/login/vendor", authLimiter, loginVendor);
router.post("/login/admin", authLimiter, loginAdmin);
router.post("/login/verify-otp", authLimiter, verifyLoginOtp);

export default router;
