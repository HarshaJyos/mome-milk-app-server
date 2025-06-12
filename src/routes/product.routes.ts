import express from "express";
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByVendor,
} from "../controllers/product.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import {
  validateProductId,
  validateProductInput,
} from "../middleware/product.middleware";
import { validateVendorId } from "../middleware/vendor.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */
router.post(
  "/",
  verifyToken,
  restrictTo("vendor"),
  validateProductInput,
  createProduct
);
router.get("/:id", validateProductId, getProduct);
router.put(
  "/:id",
  verifyToken,
  restrictTo("vendor"),
  validateProductId,
  validateProductInput,
  updateProduct
);
router.delete(
  "/:id",
  verifyToken,
  restrictTo("vendor"),
  validateProductId,
  deleteProduct
);
router.get("/vendor/:vendorId", validateVendorId, getProductsByVendor);

export default router;
