//models/index.ts
import mongoose, { Schema, model, Model } from "mongoose";
import {
  Customer,
  Vendor,
  Product,
  Delivery,
  Billing,
  Notification,
  Message,
  Complaint,
  Review,
  Admin,
  AuditLog,
} from "../types";

// Customer Schema
const customerSchema = new Schema<Customer>(
  {
    mobileNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    deliveryPreferences: {
      timeSlot: {
        type: String,
        enum: ["morning", "afternoon", "evening"],
        required: true,
      },
      nonDeliveryDays: [{ type: Date }],
      vacationPeriod: {
        startDate: { type: Date },
        endDate: { type: Date },
      },
    },
    language: { type: String, default: "en" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
customerSchema.index({ mobileNumber: 1 }, { unique: true });
customerSchema.index({ vendorId: 1 });
customerSchema.index({ "address.coordinates": "2dsphere" });

// Vendor Schema
const vendorSchema = new Schema<Vendor>(
  {
    mobileNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    shop: {
      name: { type: String, required: true },
      location: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        coordinates: {
          type: { type: String, enum: ["Point"], required: true },
          coordinates: { type: [Number], required: true },
        },
      },
      contact: { type: String, required: true },
      logo: { type: String },
    },
    uniqueId: { type: String, required: true, unique: true },
    qrCode: { type: String },
    deliverySlots: [
      { type: String, enum: ["morning", "afternoon", "evening"] },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
vendorSchema.index({ mobileNumber: 1 }, { unique: true });
vendorSchema.index({ uniqueId: 1 }, { unique: true });
vendorSchema.index({ "shop.location.coordinates": "2dsphere" });

// Product Schema
const productSchema = new Schema<Product>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["milk", "groceries", "essentials"],
      required: true,
    },
    variant: { type: String },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    description: { type: String },
    available: { type: Boolean, default: true },
    bulkDiscounts: [
      {
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    promotions: {
      discountPrice: { type: Number },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
productSchema.index({ vendorId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ available: 1 });

// Delivery Schema
const deliverySchema = new Schema<Delivery>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    deliveryDate: { type: Date, required: true },
    timeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "canceled", "skipped"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
deliverySchema.index({ customerId: 1 });
deliverySchema.index({ vendorId: 1 });
deliverySchema.index({ deliveryDate: 1 });
deliverySchema.index({ status: 1 });

// Billing Schema
const billingSchema = new Schema<Billing>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    deliveryIds: [{ type: Schema.Types.ObjectId, ref: "Delivery" }],
    totalAmount: { type: Number, required: true },
    billingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "card", "net_banking", "wallet"],
    },
    razorpayOrderId: { type: String },
    paymentDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
billingSchema.index({ customerId: 1 });
billingSchema.index({ vendorId: 1 });
billingSchema.index({ "billingPeriod.startDate": 1 });
billingSchema.index({ status: 1 });

// Notification Schema
const notificationSchema = new Schema<Notification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientType: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "order_update",
        "cancellation",
        "payment_reminder",
        "delivery_reminder",
        "daily_summary",
        "promotion",
      ],
      required: true,
    },
    message: { type: String, required: true },
    status: { type: String, enum: ["sent", "read"], default: "sent" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ createdAt: 1 });

// Message Schema
const messageSchema = new Schema<Message>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    receiverId: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ createdAt: 1 });

// Complaint Schema
const complaintSchema = new Schema<Complaint>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    deliveryId: { type: Schema.Types.ObjectId, ref: "Delivery" },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    resolution: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
complaintSchema.index({ customerId: 1 });
complaintSchema.index({ vendorId: 1 });
complaintSchema.index({ status: 1 });

// Review Schema
const reviewSchema = new Schema<Review>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
reviewSchema.index({ vendorId: 1 });
reviewSchema.index({ customerId: 1 });

// Admin Schema
const adminSchema = new Schema<Admin>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "support"], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
adminSchema.index({ email: 1 }, { unique: true });

// Audit Log Schema
const auditLogSchema = new Schema<AuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, required: true },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ createdAt: 1 });

// Export Models
export const CustomerModel: Model<Customer> = model<Customer>(
  "Customer",
  customerSchema
);
export const VendorModel: Model<Vendor> = model<Vendor>("Vendor", vendorSchema);
export const ProductModel: Model<Product> = model<Product>(
  "Product",
  productSchema
);
export const DeliveryModel: Model<Delivery> = model<Delivery>(
  "Delivery",
  deliverySchema
);
export const BillingModel: Model<Billing> = model<Billing>(
  "Billing",
  billingSchema
);
export const NotificationModel: Model<Notification> = model<Notification>(
  "Notification",
  notificationSchema
);
export const MessageModel: Model<Message> = model<Message>(
  "Message",
  messageSchema
);
export const ComplaintModel: Model<Complaint> = model<Complaint>(
  "Complaint",
  complaintSchema
);
export const ReviewModel: Model<Review> = model<Review>("Review", reviewSchema);
export const AdminModel: Model<Admin> = model<Admin>("Admin", adminSchema);
export const AuditLogModel: Model<AuditLog> = model<AuditLog>(
  "AuditLog",
  auditLogSchema
);
