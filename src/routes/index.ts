// routes/index.ts

import express from "express";

import authRoutes from "./auth.routes";
import customerRoutes from "./customer.routes";
import vendorRoutes from "./vendor.routes";
import productRoutes from "./product.routes";
import deliveryRoutes from "./delivery.routes";
import billingRoutes from "./billing.routes";
import notificationRoutes from "./notification.routes";
import messageRoutes from "./message.routes";
import complaintRoutes from "./complaint.routes";
import reviewRoutes from "./review.routes";
import adminRoutes from "./admin.routes";
import auditLogRoutes from "./auditLog.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/vendors", vendorRoutes);
router.use("/products", productRoutes);
router.use("/deliveries", deliveryRoutes);
router.use("/billings", billingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/messages", messageRoutes);
router.use("/complaints", complaintRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admins", adminRoutes);
router.use("/auditLogs", auditLogRoutes);

export default router;
