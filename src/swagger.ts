import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Milk App API",
    description:
      "API for managing dairy product delivery, payments, and user interactions",
    version: "1.0.0",
  },
  host:
    process.env.NODE_ENV === "production"
      ? "milkapp.your-production-host.com"
      : "localhost:8000",
  schemes: process.env.NODE_ENV === "production" ? ["https"] : ["http"],
  basePath: "/api",
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Enter JWT token as: Bearer <token>",
    },
  },
  components: {
    schemas: {
      Customer: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Customer ID" },
          mobileNumber: {
            type: "string",
            description: "Customer mobile number",
            example: "+919032185199",
          },
          name: {
            type: "string",
            description: "Customer name",
            example: "John Doe",
          },
          email: {
            type: "string",
            description: "Customer email",
            example: "john@example.com",
          },
          address: {
            type: "object",
            properties: {
              street: { type: "string", example: "123 Main St" },
              city: { type: "string", example: "Mumbai" },
              state: { type: "string", example: "Maharashtra" },
              pincode: { type: "string", example: "400001" },
              coordinates: {
                type: "object",
                properties: {
                  lat: { type: "number", example: 19.076 },
                  lng: { type: "number", example: 72.8777 },
                },
              },
            },
          },
          deliveryPreferences: {
            type: "object",
            properties: {
              timeSlot: { type: "string", example: "6AM-8AM" },
              instructions: { type: "string", example: "Leave at doorstep" },
            },
          },
          vendorId: { type: "string", description: "Assigned vendor ID" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["mobileNumber", "name", "address"],
      },
      Vendor: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Vendor ID" },
          mobileNumber: {
            type: "string",
            description: "Vendor mobile number",
            example: "+919876543210",
          },
          name: {
            type: "string",
            description: "Vendor name",
            example: "Fresh Dairy",
          },
          shop: {
            type: "object",
            properties: {
              name: { type: "string", example: "Fresh Dairy Shop" },
              address: {
                type: "object",
                properties: {
                  street: { type: "string", example: "456 Market St" },
                  city: { type: "string", example: "Pune" },
                  state: { type: "string", example: "Maharashtra" },
                  pincode: { type: "string", example: "411002" },
                },
              },
              license: { type: "string", example: "LIC123456" },
            },
          },
          uniqueId: {
            type: "string",
            description: "Unique vendor ID for QR code",
            example: "vendor-uuid-123",
          },
          qrCode: {
            type: "string",
            description: "QR code URL (set by frontend)",
          },
          status: {
            type: "string",
            enum: ["pending", "approved", "rejected"],
            example: "approved",
          },
          deliverySlots: {
            type: "array",
            items: { type: "string" },
            example: ["6AM-8AM", "4PM-6PM"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["mobileNumber", "name", "shop", "uniqueId", "status"],
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Product ID" },
          vendorId: { type: "string", description: "Vendor ID" },
          name: { type: "string", example: "Milk" },
          category: { type: "string", example: "Dairy" },
          price: { type: "number", example: 70 },
          unit: { type: "string", example: "liter" },
          variant: { type: "string", example: "Full Cream" },
          description: { type: "string", example: "Fresh full cream milk" },
          available: { type: "boolean", example: true },
          bulkDiscounts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quantity: { type: "number", example: 10 },
                discount: { type: "number", example: 5 },
              },
            },
          },
          promotions: {
            type: "object",
            properties: {
              discountPrice: { type: "number", example: 60 },
              validUntil: { type: "string", format: "date-time" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["vendorId", "name", "category", "price", "unit"],
      },
      Delivery: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Delivery ID" },
          customerId: { type: "string", description: "Customer ID" },
          vendorId: { type: "string", description: "Vendor ID" },
          productId: { type: "string", description: "Product ID" },
          quantity: { type: "number", example: 2 },
          price: { type: "number", example: 140 },
          deliveryDate: {
            type: "string",
            format: "date",
            example: "2025-06-12",
          },
          timeSlot: { type: "string", example: "6AM-8AM" },
          status: {
            type: "string",
            enum: ["pending", "completed", "canceled", "skipped"],
            example: "pending",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "customerId",
          "vendorId",
          "productId",
          "quantity",
          "deliveryDate",
          "timeSlot",
        ],
      },
      Billing: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Billing ID" },
          customerId: { type: "string", description: "Customer ID" },
          vendorId: { type: "string", description: "Vendor ID" },
          deliveryIds: {
            type: "array",
            items: { type: "string" },
            description: "Delivery IDs",
          },
          totalAmount: { type: "number", example: 280 },
          razorpayOrderId: { type: "string", description: "Razorpay order ID" },
          status: {
            type: "string",
            enum: ["pending", "paid", "failed"],
            example: "pending",
          },
          billingPeriod: {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                format: "date",
                example: "2025-06-01",
              },
              endDate: {
                type: "string",
                format: "date",
                example: "2025-06-30",
              },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: [
          "customerId",
          "vendorId",
          "deliveryIds",
          "totalAmount",
          "billingPeriod",
        ],
      },
      Notification: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Notification ID" },
          recipientId: { type: "string", description: "Recipient ID" },
          recipientType: {
            type: "string",
            enum: ["customer", "vendor", "admin"],
            example: "customer",
          },
          type: { type: "string", example: "order_update" },
          message: { type: "string", example: "Your order has been shipped" },
          status: {
            type: "string",
            enum: ["unread", "read"],
            example: "unread",
          },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["recipientId", "recipientType", "type", "message"],
      },
      Message: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Message ID" },
          senderId: { type: "string", description: "Sender ID" },
          receiverId: { type: "string", description: "Receiver ID" },
          message: { type: "string", example: "When will my order arrive?" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["senderId", "receiverId", "message"],
      },
      Complaint: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Complaint ID" },
          customerId: { type: "string", description: "Customer ID" },
          vendorId: { type: "string", description: "Vendor ID" },
          deliveryId: { type: "string", description: "Delivery ID" },
          description: { type: "string", example: "Milk was spoiled" },
          status: {
            type: "string",
            enum: ["pending", "resolved", "rejected"],
            example: "pending",
          },
          resolution: { type: "string", example: "Refund issued" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["customerId", "vendorId", "deliveryId", "description"],
      },
      Review: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Review ID" },
          customerId: { type: "string", description: "Customer ID" },
          vendorId: { type: "string", description: "Vendor ID" },
          rating: { type: "number", example: 4 },
          comment: { type: "string", example: "Great service!" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["customerId", "vendorId", "rating"],
      },
      Admin: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Admin ID" },
          email: { type: "string", example: "admin@example.com" },
          passwordHash: {
            type: "string",
            description: "Hashed password (not exposed)",
          },
          role: { type: "string", example: "superadmin" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["email", "passwordHash", "role"],
      },
      AuditLog: {
        type: "object",
        properties: {
          _id: { type: "string", description: "Audit Log ID" },
          action: { type: "string", example: "customer_created" },
          performedBy: {
            type: "string",
            description: "User ID who performed the action",
          },
          targetId: { type: "string", description: "Target resource ID" },
          details: {
            type: "object",
            additionalProperties: true,
            example: { mobileNumber: "+919032185199" },
          },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["action", "performedBy"],
      },
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Invalid input" },
        },
        required: ["status", "message"],
      },
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/index.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
