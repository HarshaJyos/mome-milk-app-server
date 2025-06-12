import express from "express";
import { createAdmin, getAdmin } from "../controllers/admin.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/role.middleware";
import { validateAdminId } from "../middleware/admin.middleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin management endpoints
 */
router.post("/", verifyToken, restrictTo("admin"), createAdmin);
router.get("/:id", verifyToken, restrictTo("admin"), validateAdminId, getAdmin);

export default router;
