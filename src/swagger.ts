// src/swagger.ts
import dotenv from "dotenv";
dotenv.config();

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Milk App API",
    description:
      "API for managing dairy product delivery, payments, and user interactions",
    version: "1.0.0",
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? process.env.PROD_API_HOST || "https://api.milkapp.com"
          : process.env.DEV_API_HOST || "http://localhost:5000",
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token as: Bearer <token>",
      },
    },
    schemas: {
      Customer: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
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
              postalCode: { type: "string", example: "400001" },
              coordinates: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["Point"], example: "Point" },
                  coordinates: {
                    type: "array",
                    items: { type: "number" },
                    example: [72.8777, 19.076],
                  },
                },
                required: ["type", "coordinates"],
              },
            },
            required: ["street", "city", "state", "postalCode", "coordinates"],
          },
          deliveryPreferences: {
            type: "object",
            properties: {
              timeSlot: {
                type: "string",
                enum: ["morning", "afternoon", "evening"],
                example: "morning",
              },
              nonDeliveryDays: {
                type: "array",
                items: { type: "string", format: "date" },
                example: [],
              },
              vacationPeriod: {
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
                    example: "2025-06-07",
                  },
                },
              },
            },
            required: ["timeSlot"],
          },
          vendorId: {
            type: "string",
            description: "Assigned vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
          language: {
            type: "string",
            description: "Preferred language",
            example: "en",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: [
          "mobileNumber",
          "name",
          "address",
          "deliveryPreferences",
          "vendorId",
        ],
      },
      Vendor: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
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
              location: {
                type: "object",
                properties: {
                  street: { type: "string", example: "456 Market St" },
                  city: { type: "string", example: "Pune" },
                  state: { type: "string", example: "Maharashtra" },
                  postalCode: { type: "string", example: "411002" },
                  coordinates: {
                    type: "object",
                    properties: {
                      type: {
                        type: "string",
                        enum: ["Point"],
                        example: "Point",
                      },
                      coordinates: {
                        type: "array",
                        items: { type: "number" },
                        example: [73.8567, 18.5204],
                      },
                    },
                    required: ["type", "coordinates"],
                  },
                },
                required: [
                  "street",
                  "city",
                  "state",
                  "postalCode",
                  "coordinates",
                ],
              },
              contact: { type: "string", example: "+919876543210" },
              logo: { type: "string", example: "https://example.com/logo.png" },
            },
            required: ["name", "location", "contact"],
          },
          uniqueId: {
            type: "string",
            description: "Unique vendor ID for QR code",
            example: "vendor-uuid-123",
          },
          qrCode: {
            type: "string",
            description: "QR code URL",
            example: "https://example.com/qr/123",
          },
          deliverySlots: {
            type: "array",
            items: {
              type: "string",
              enum: ["morning", "afternoon", "evening"],
            },
            example: ["morning", "evening"],
          },
          status: {
            type: "string",
            enum: ["pending", "approved", "suspended"],
            example: "approved",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: [
          "mobileNumber",
          "name",
          "shop",
          "uniqueId",
          "status",
          "deliverySlots",
        ],
      },
      Product: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Product ID",
            example: "60d5f3a4b1234567890abcde",
          },
          vendorId: {
            type: "string",
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
          name: { type: "string", example: "Milk" },
          category: {
            type: "string",
            enum: ["milk", "groceries", "essentials"],
            example: "milk",
          },
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
                price: { type: "number", example: 65 },
              },
              required: ["quantity", "price"],
            },
          },
          promotions: {
            type: "object",
            properties: {
              discountPrice: { type: "number", example: 60 },
              startDate: {
                type: "string",
                format: "date-time",
                example: "2025-06-01T00:00:00Z",
              },
              endDate: {
                type: "string",
                format: "date-time",
                example: "2025-06-30T23:59:59Z",
              },
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["vendorId", "name", "category", "price", "unit"],
      },
      Delivery: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Delivery ID",
            example: "60d5f3a4b1234567890abcde",
          },
          customerId: {
            type: "string",
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
          vendorId: {
            type: "string",
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
          productId: {
            type: "string",
            description: "Product ID",
            example: "60d5f3a4b1234567890abcde",
          },
          quantity: { type: "number", example: 2 },
          price: { type: "number", example: 140 },
          deliveryDate: {
            type: "string",
            format: "date",
            example: "2025-06-12",
          },
          timeSlot: {
            type: "string",
            enum: ["morning", "afternoon", "evening"],
            example: "morning",
          },
          status: {
            type: "string",
            enum: ["pending", "completed", "canceled", "skipped"],
            example: "pending",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
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
          _id: {
            type: "string",
            description: "Billing ID",
            example: "60d5f3a4b1234567890abcde",
          },
          customerId: {
            type: "string",
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
          vendorId: {
            type: "string",
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
          deliveryIds: {
            type: "array",
            items: { type: "string" },
            example: ["60d5f3a4b1234567890abcde"],
          },
          totalAmount: { type: "number", example: 280 },
          razorpayOrderId: {
            type: "string",
            description: "Razorpay order ID",
            example: "order_123456",
          },
          status: {
            type: "string",
            enum: ["pending", "paid", "overdue"],
            example: "pending",
          },
          paymentMethod: {
            type: "string",
            enum: ["UPI", "card", "net_banking", "wallet"],
            example: "UPI",
          },
          paymentDate: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
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
            required: ["startDate", "endDate"],
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
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
          _id: {
            type: "string",
            description: "Notification ID",
            example: "60d5f3a4b1234567890abcde",
          },
          recipientId: {
            type: "string",
            description: "Recipient ID",
            example: "60d5f3a4b1234567890abcde",
          },
          recipientType: {
            type: "string",
            enum: ["customer", "vendor", "admin"],
            example: "customer",
          },
          type: {
            type: "string",
            enum: [
              "order_update",
              "cancellation",
              "payment_reminder",
              "delivery_reminder",
              "daily_summary",
              "promotion",
            ],
            example: "order_update",
          },
          message: { type: "string", example: "Your order has been shipped" },
          status: { type: "string", enum: ["sent", "read"], example: "sent" },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["recipientId", "recipientType", "type", "message"],
      },
      Message: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Message ID",
            example: "60d5f3a4b1234567890abcde",
          },
          senderId: {
            type: "string",
            description: "Sender ID",
            example: "60d5f3a4b1234567890abcde",
          },
          receiverId: {
            type: "string",
            description: "Receiver ID",
            example: "60d5f3a4b1234567890abcde",
          },
          message: { type: "string", example: "When will my order arrive?" },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["senderId", "receiverId", "message"],
      },
      Complaint: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Complaint ID",
            example: "60d5f3a4b1234567890abcde",
          },
          customerId: {
            type: "string",
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
          vendorId: {
            type: "string",
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
          deliveryId: {
            type: "string",
            description: "Delivery ID",
            example: "60d5f3a4b1234567890abcde",
          },
          description: { type: "string", example: "Milk was spoiled" },
          status: {
            type: "string",
            enum: ["open", "in_progress", "resolved"],
            example: "open",
          },
          resolution: { type: "string", example: "Refund issued" },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["customerId", "vendorId", "deliveryId", "description"],
      },
      Review: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Review ID",
            example: "60d5f3a4b1234567890abcde",
          },
          customerId: {
            type: "string",
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
          vendorId: {
            type: "string",
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
          rating: { type: "number", example: 4, minimum: 1, maximum: 5 },
          comment: { type: "string", example: "Great service!" },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["customerId", "vendorId", "rating"],
      },
      Admin: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Admin ID",
            example: "60d5f3a4b1234567890abcde",
          },
          email: { type: "string", example: "admin@example.com" },
          role: {
            type: "string",
            enum: ["super_admin", "support"],
            example: "super_admin",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["email", "role"],
      },
      AuditLog: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Audit Log ID",
            example: "60d5f3a4b1234567890abcde",
          },
          action: { type: "string", example: "customer_created" },
          performedBy: {
            type: "string",
            description: "User ID who performed the action",
            example: "60d5f3a4b1234567890abcde",
          },
          targetId: {
            type: "string",
            description: "Target resource ID",
            example: "60d5f3a4b1234567890abcde",
          },
          details: {
            type: "object",
            additionalProperties: true,
            example: { mobileNumber: "+919032185199" },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2025-06-12T10:41:00Z",
          },
        },
        required: ["action", "performedBy"],
      },
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Invalid input" },
          requestId: {
            type: "string",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
          stack: { type: "string" },
        },
        required: ["status", "message"],
      },
    },
  },
  paths: {
    "/api/auth/signup/customer": {
      post: {
        summary: "Sign up a new customer",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mobileNumber: { type: "string", example: "+919032185199" },
                  name: { type: "string", example: "John Doe" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  address: {
                    $ref: "#/components/schemas/Customer/properties/address",
                  },
                  deliveryPreferences: {
                    $ref: "#/components/schemas/Customer/properties/deliveryPreferences",
                  },
                  vendorId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  language: { type: "string", example: "en" },
                },
                required: [
                  "mobileNumber",
                  "name",
                  "address",
                  "deliveryPreferences",
                  "vendorId",
                ],
              },
            },
          },
        },
        responses: {
          201: { description: "Customer signed up, OTP sent" },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Mobile number already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup/vendor": {
      post: {
        summary: "Sign up a new vendor",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mobileNumber: { type: "string", example: "+919876543210" },
                  name: { type: "string", example: "Fresh Dairy" },
                  shop: { $ref: "#/components/schemas/Vendor/properties/shop" },
                  deliverySlots: {
                    $ref: "#/components/schemas/Vendor/properties/deliverySlots",
                  },
                },
                required: ["mobileNumber", "name", "shop", "deliverySlots"],
              },
            },
          },
        },
        responses: {
          201: { description: "Vendor signed up, OTP sent" },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Mobile number already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup/admin": {
      post: {
        summary: "Sign up a new admin",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@example.com",
                  },
                  password: { type: "string", example: "Password123!" },
                  role: {
                    type: "string",
                    enum: ["super_admin", "support"],
                    example: "super_admin",
                  },
                },
                required: ["email", "password", "role"],
              },
            },
          },
        },
        responses: {
          201: { description: "Admin created" },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-otp": {
      post: {
        summary: "Verify OTP and complete signup/login",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sessionId: {
                    type: "string",
                    example: "123e4567-e89b-12d3-a456-426614174000",
                  },
                  role: {
                    type: "string",
                    enum: ["customer", "vendor"],
                    example: "customer",
                  },
                  mobileNumber: { type: "string", example: "+919032185199" },
                  code: { type: "string", example: "123456" },
                },
                required: ["sessionId", "role", "mobileNumber", "code"],
              },
            },
          },
        },
        responses: {
          200: { description: "OTP verified, JWT token issued" },
          400: {
            description: "Invalid OTP or session",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login/customer": {
      post: {
        summary: "Login customer with OTP",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mobileNumber: { type: "string", example: "+919032185199" },
                },
                required: ["mobileNumber"],
              },
            },
          },
        },
        responses: {
          200: { description: "OTP sent" },
          404: {
            description: "Customer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login/vendor": {
      post: {
        summary: "Login vendor with OTP",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mobileNumber: { type: "string", example: "+919876543210" },
                },
                required: ["mobileNumber"],
              },
            },
          },
        },
        responses: {
          200: { description: "OTP sent" },
          404: {
            description: "Vendor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login/admin": {
      post: {
        summary: "Login admin with email and password",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@example.com",
                  },
                  password: { type: "string", example: "Password123!" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: { description: "JWT token issued" },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login/verify-otp": {
      post: {
        summary: "Verify OTP for customer or vendor login",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sessionId: {
                    type: "string",
                    example: "123e4567-e89b-12d3-a456-426614174000",
                  },
                  role: {
                    type: "string",
                    enum: ["customer", "vendor"],
                    example: "customer",
                  },
                  mobileNumber: { type: "string", example: "+919032185199" },
                  code: { type: "string", example: "123456" },
                },
                required: ["sessionId", "role", "mobileNumber", "code"],
              },
            },
          },
        },
        responses: {
          200: { description: "OTP verified, JWT token issued" },
          400: {
            description: "Invalid OTP or session",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/customers/{id}": {
      get: {
        summary: "Get customer profile",
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Customer profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Customer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update customer profile",
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "john@example.com",
                  },
                  address: {
                    $ref: "#/components/schemas/Customer/properties/address",
                  },
                  deliveryPreferences: {
                    $ref: "#/components/schemas/Customer/properties/deliveryPreferences",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated customer profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Customer not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/customers/{id}/vendor": {
      put: {
        summary: "Assign vendor to customer",
        tags: ["Customers"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Customer ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  vendorId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                },
                required: ["vendorId"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Vendor assigned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Customer" },
              },
            },
          },
          400: {
            description: "Invalid vendor ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Customer or vendor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/vendors/{id}": {
      get: {
        summary: "Get vendor profile",
        tags: ["Vendors"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Vendor profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vendor" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Vendor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update vendor profile",
        tags: ["Vendors"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Fresh Dairy" },
                  shop: { $ref: "#/components/schemas/Vendor/properties/shop" },
                  deliverySlots: {
                    $ref: "#/components/schemas/Vendor/properties/deliverySlots",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated vendor profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vendor" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Vendor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/vendors/{id}/approve": {
      put: {
        summary: "Approve vendor",
        tags: ["Vendors"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Vendor approved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Vendor" },
              },
            },
          },
          400: {
            description: "Invalid vendor",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Vendor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      post: {
        summary: "Create a new product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Milk" },
                  category: {
                    type: "string",
                    enum: ["milk", "groceries", "essentials"],
                    example: "milk",
                  },
                  price: { type: "number", example: 70 },
                  unit: { type: "string", example: "liter" },
                  variant: { type: "string", example: "Full Cream" },
                  description: {
                    type: "string",
                    example: "Fresh full cream milk",
                  },
                  bulkDiscounts: {
                    $ref: "#/components/schemas/Product/properties/bulkDiscounts",
                  },
                  promotions: {
                    $ref: "#/components/schemas/Product/properties/promotions",
                  },
                },
                required: ["name", "category", "price", "unit"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        summary: "Get product details",
        tags: ["Products"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Product details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      put: {
        summary: "Update product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Milk" },
                  category: {
                    type: "string",
                    enum: ["milk", "groceries", "essentials"],
                    example: "milk",
                  },
                  price: { type: "number", example: 70 },
                  unit: { type: "string", example: "liter" },
                  variant: { type: "string", example: "Full Cream" },
                  description: {
                    type: "string",
                    example: "Fresh full cream milk",
                  },
                  bulkDiscounts: {
                    $ref: "#/components/schemas/Product/properties/bulkDiscounts",
                  },
                  promotions: {
                    $ref: "#/components/schemas/Product/properties/promotions",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated product",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete product",
        tags: ["Products"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Product ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          204: { description: "Product deleted" },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/products/vendor/{vendorId}": {
      get: {
        summary: "Get products by vendor",
        tags: ["Products"],
        parameters: [
          {
            in: "path",
            name: "vendorId",
            required: true,
            schema: { type: "string" },
            description: "Vendor ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Product" },
                },
              },
            },
          },
          404: {
            description: "Vendor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/deliveries": {
      post: {
        summary: "Schedule a delivery",
        tags: ["Deliveries"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  productId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  quantity: { type: "number", example: 2 },
                  deliveryDate: {
                    type: "string",
                    format: "date",
                    example: "2025-06-12",
                  },
                  timeSlot: {
                    type: "string",
                    enum: ["morning", "afternoon", "evening"],
                    example: "morning",
                  },
                },
                required: ["productId", "quantity", "deliveryDate", "timeSlot"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Delivery scheduled",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Delivery" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/deliveries/{id}": {
      get: {
        summary: "Get delivery details",
        tags: ["Deliveries"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Delivery ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Delivery details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Delivery" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Delivery not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/deliveries/{id}/status": {
      put: {
        summary: "Update delivery status",
        tags: ["Deliveries"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Delivery ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["pending", "completed", "canceled", "skipped"],
                    example: "completed",
                  },
                },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Delivery status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Delivery" },
              },
            },
          },
          400: {
            description: "Invalid status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Delivery not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/billings": {
      post: {
        summary: "Create a new billing",
        tags: ["Billings"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  customerId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  vendorId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  deliveryIds: {
                    type: "array",
                    items: { type: "string" },
                    example: ["60d5f3a4b1234567890abcde"],
                  },
                  totalAmount: { type: "number", example: 280 },
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
                    required: ["startDate", "endDate"],
                  },
                },
                required: [
                  "customerId",
                  "vendorId",
                  "deliveryIds",
                  "totalAmount",
                  "billingPeriod",
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Billing created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Billing" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/billings/{id}": {
      get: {
        summary: "Get billing details",
        tags: ["Billings"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Billing ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Billing details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Billing" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Billing not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/billings/{id}/pay": {
      post: {
        summary: "Initiate payment for a billing",
        tags: ["Billings"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Billing ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  paymentMethod: {
                    type: "string",
                    enum: ["UPI", "card", "net_banking", "wallet"],
                    example: "UPI",
                  },
                },
                required: ["paymentMethod"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment initiated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { razorpayOrderId: { type: "string" } },
                },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Billing not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/notifications": {
      post: {
        summary: "Send notification",
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  recipientId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  recipientType: {
                    type: "string",
                    enum: ["customer", "vendor", "admin"],
                    example: "customer",
                  },
                  type: {
                    type: "string",
                    enum: [
                      "order_update",
                      "cancellation",
                      "payment_reminder",
                      "delivery_reminder",
                      "daily_summary",
                      "promotion",
                    ],
                    example: "order_update",
                  },
                  message: {
                    type: "string",
                    example: "Your order has been shipped",
                  },
                },
                required: ["recipientId", "recipientType", "type", "message"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Notification sent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Notification" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      get: {
        summary: "Get user notifications",
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of notifications",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Notification" },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/notifications/{id}/read": {
      put: {
        summary: "Mark notification as read",
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Notification ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Notification marked as read",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Notification" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Notification not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/messages": {
      post: {
        summary: "Send message",
        tags: ["Messages"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  receiverId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  message: {
                    type: "string",
                    example: "When will my order arrive?",
                  },
                },
                required: ["receiverId", "message"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Message sent",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Message" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      get: {
        summary: "Get conversation history",
        tags: ["Messages"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "receiverId",
            required: true,
            schema: { type: "string" },
            description: "Receiver ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Conversation history",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Message" },
                },
              },
            },
          },
          400: {
            description: "Invalid receiver ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/complaints": {
      post: {
        summary: "Create a complaint",
        tags: ["Complaints"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  vendorId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  deliveryId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  description: { type: "string", example: "Milk was spoiled" },
                },
                required: ["vendorId", "deliveryId", "description"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Complaint created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Complaint" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/complaints/{id}": {
      get: {
        summary: "Get complaint details",
        tags: ["Complaints"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Complaint ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Complaint details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Complaint" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Complaint not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/complaints/{id}/resolve": {
      put: {
        summary: "Resolve a complaint",
        tags: ["Complaints"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Complaint ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  resolution: { type: "string", example: "Refund issued" },
                },
                required: ["resolution"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Complaint resolved",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Complaint" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Complaint not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/reviews": {
      post: {
        summary: "Create a review",
        tags: ["Reviews"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  vendorId: {
                    type: "string",
                    example: "60d5f3a4b1234567890abcde",
                  },
                  rating: {
                    type: "number",
                    example: 4,
                    minimum: 1,
                    maximum: 5,
                  },
                  comment: { type: "string", example: "Great service!" },
                },
                required: ["vendorId", "rating"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Review created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Review" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/reviews/{id}": {
      get: {
        summary: "Get review details",
        tags: ["Reviews"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Review ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Review details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Review" },
              },
            },
          },
          404: {
            description: "Review not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/admins": {
      post: {
        summary: "Create a new admin",
        tags: ["Admins"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@example.com",
                  },
                  password: { type: "string", example: "Password123!" },
                  role: {
                    type: "string",
                    enum: ["super_admin", "support"],
                    example: "super_admin",
                  },
                },
                required: ["email", "password", "role"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Admin created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Admin" },
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          409: {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/admins/{id}": {
      get: {
        summary: "Get admin details",
        tags: ["Admins"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Admin ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Admin details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Admin" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Admin not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auditLogs": {
      get: {
        summary: "Get audit logs",
        tags: ["AuditLogs"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of audit logs",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/AuditLog" },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auditLogs/{id}": {
      get: {
        summary: "Get audit log details",
        tags: ["AuditLogs"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Audit Log ID",
            example: "60d5f3a4b1234567890abcde",
          },
        ],
        responses: {
          200: {
            description: "Audit log details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuditLog" },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Audit log not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};
