import { Request, Response, NextFunction } from "express";
import {
  CustomerModel,
  VendorModel,
  AdminModel,
  AuditLogModel,
} from "../models";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errorMiddleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Twilio from "twilio";
import { v4 as uuidv4 } from "uuid";
import winston from "winston";
import { redisClient } from "../database";
import dotenv from "dotenv";

dotenv.config();

interface CustomRequest extends Request {
  user?: {
    id: any;
    role: "customer" | "vendor" | "admin";
    mobileNumber?: string;
    email?: string;
  };
  requestId?: string;
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID || "",
  process.env.TWILIO_AUTH_TOKEN || ""
);
const verifyServiceSid = process.env.TWILIO_VERIFY_SID || "";

const generateJwtToken = (
  id: string,
  role: "customer" | "vendor" | "admin"
) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

/**
 * Validates required fields in an object, throwing BadRequestError if any are missing or invalid.
 */
const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
) => {
  const missingFields: string[] = [];
  requiredFields.forEach((field) => {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {
      missingFields.push(field);
    }
  });
  if (missingFields.length > 0) {
    throw new BadRequestError(
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }
};

/**
 * @swagger
 * /api/auth/signup/customer:
 *   post:
 *     summary: Sign up a new customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - name
 *               - address
 *               - deliveryPreferences
 *               - vendorId
 *             properties:
 *               mobileNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - postalCode
 *                   - coordinates
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     required:
 *                       - type
 *                       - coordinates
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [Point]
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *               deliveryPreferences:
 *                 type: object
 *                 required:
 *                   - timeSlot
 *                 properties:
 *                   timeSlot:
 *                     type: string
 *                     enum: [morning, afternoon, evening]
 *                   nonDeliveryDays:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: date
 *                   vacationPeriod:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *               vendorId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer signed up, OTP sent
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Mobile number already exists
 */
const signupCustomer = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobileNumber, name, address, deliveryPreferences, vendorId } =
      req.body;

    // Validate top-level required fields
    validateRequiredFields(req.body, [
      "mobileNumber",
      "name",
      "address",
      "deliveryPreferences",
      "vendorId",
    ]);

    // Validate address fields
    validateRequiredFields(address, [
      "street",
      "city",
      "state",
      "postalCode",
      "coordinates",
    ]);
    validateRequiredFields(address.coordinates, ["type", "coordinates"]);
    if (address.coordinates.type !== "Point") {
      throw new BadRequestError('address.coordinates.type must be "Point"');
    }
    if (
      !Array.isArray(address.coordinates.coordinates) ||
      address.coordinates.coordinates.length !== 2
    ) {
      throw new BadRequestError(
        "address.coordinates.coordinates must be [longitude, latitude]"
      );
    }

    // Validate deliveryPreferences fields
    validateRequiredFields(deliveryPreferences, ["timeSlot"]);
    if (
      !["morning", "afternoon", "evening"].includes(
        deliveryPreferences.timeSlot
      )
    ) {
      throw new BadRequestError(
        "deliveryPreferences.timeSlot must be one of: morning, afternoon, evening"
      );
    }

    const existingCustomer = await CustomerModel.findOne({ mobileNumber });
    if (existingCustomer) {
      throw new ConflictError("Mobile number already registered");
    }

    const customerData = {
      mobileNumber,
      name,
      email: req.body.email || undefined,
      address,
      deliveryPreferences: {
        timeSlot: deliveryPreferences.timeSlot,
        nonDeliveryDays: deliveryPreferences.nonDeliveryDays || [],
        vacationPeriod: deliveryPreferences.vacationPeriod || undefined,
      },
      vendorId,
      language: req.body.language || "en",
    };
    const sessionId = uuidv4();
    await redisClient?.setex(
      `signup:customer:${sessionId}`,
      600,
      JSON.stringify(customerData)
    );

    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
      });

    logger.info(`Customer signup initiated: ${mobileNumber}`, {
      sessionId,
      requestId: req.requestId,
    });
    res.status(201).json({ sessionId, message: "OTP sent to mobile number" });
  } catch (error) {
    logger.error("Customer signup failed", { error, requestId: req.requestId });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/signup/vendor:
 *   post:
 *     summary: Sign up a new vendor
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *               - name
 *               - shop
 *               - deliverySlots
 *             properties:
 *               mobileNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               shop:
 *                 type: object
 *                 required:
 *                   - name
 *                   - location
 *                   - contact
 *                 properties:
 *                   name:
 *                     type: string
 *                   location:
 *                     type: object
 *                     required:
 *                       - street
 *                       - city
 *                       - state
 *                       - postalCode
 *                       - coordinates
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       postalCode:
 *                         type: string
 *                       coordinates:
 *                         type: object
 *                         required:
 *                           - type
 *                           - coordinates
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [Point]
 *                           coordinates:
 *                             type: array
 *                             items:
 *                               type: number
 *                   contact:
 *                     type: string
 *                   logo:
 *                     type: string
 *               deliverySlots:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [morning, afternoon, evening]
 *     responses:
 *       201:
 *         description: Vendor signed up, OTP sent
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Mobile number already exists
 */
const signupVendor = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobileNumber, name, shop, deliverySlots } = req.body;

    // Validate top-level required fields
    validateRequiredFields(req.body, [
      "mobileNumber",
      "name",
      "shop",
      "deliverySlots",
    ]);

    // Validate shop fields
    validateRequiredFields(shop, ["name", "location", "contact"]);
    validateRequiredFields(shop.location, [
      "street",
      "city",
      "state",
      "postalCode",
      "coordinates",
    ]);
    validateRequiredFields(shop.location.coordinates, ["type", "coordinates"]);
    if (shop.location.coordinates.type !== "Point") {
      throw new BadRequestError(
        'shop.location.coordinates.type must be "Point"'
      );
    }
    if (
      !Array.isArray(shop.location.coordinates.coordinates) ||
      shop.location.coordinates.coordinates.length !== 2
    ) {
      throw new BadRequestError(
        "shop.location.coordinates.coordinates must be [longitude, latitude]"
      );
    }

    // Validate deliverySlots
    if (!Array.isArray(deliverySlots) || deliverySlots.length === 0) {
      throw new BadRequestError("deliverySlots must be a non-empty array");
    }
    deliverySlots.forEach((slot: string) => {
      if (!["morning", "afternoon", "evening"].includes(slot)) {
        throw new BadRequestError(
          "deliverySlots must contain only: morning, afternoon, evening"
        );
      }
    });

    const existingVendor = await VendorModel.findOne({ mobileNumber });
    if (existingVendor) {
      throw new ConflictError("Mobile number already registered");
    }

    const uniqueId = uuidv4();
    const vendorData = {
      mobileNumber,
      name,
      shop: {
        name: shop.name,
        location: shop.location,
        contact: shop.contact,
        logo: shop.logo || undefined,
      },
      uniqueId,
      qrCode: "pending", // Placeholder, to be updated by frontend
      deliverySlots,
      status: "pending",
    };
    const sessionId = uuidv4();
    await redisClient?.setex(
      `signup:vendor:${sessionId}`,
      600,
      JSON.stringify(vendorData)
    );

    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
      });

    logger.info(`Vendor signup initiated: ${mobileNumber}`, {
      sessionId,
      requestId: req.requestId,
    });
    res
      .status(201)
      .json({ sessionId, uniqueId, message: "OTP sent to mobile number" });
  } catch (error) {
    logger.error("Vendor signup failed", { error, requestId: req.requestId });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/signup/admin:
 *   post:
 *     summary: Sign up a new admin
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, support]
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
const signupAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    validateRequiredFields(req.body, ["email", "password", "role"]);
    if (!["super_admin", "support"].includes(role)) {
      throw new BadRequestError("role must be one of: super_admin, support");
    }

    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new AdminModel({ email, passwordHash, role });
    await admin.save();

    await AuditLogModel.create({
      action: "admin_created",
      performedBy: req.user?.id || admin._id,
      targetId: admin._id,
      details: { email, role },
    });

    logger.info(`Admin created: ${email}`, { requestId: req.requestId });
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    logger.error("Admin signup failed", { error, requestId: req.requestId });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and complete signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - role
 *               - mobileNumber
 *               - code
 *             properties:
 *               sessionId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, vendor]
 *               mobileNumber:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup completed, JWT token issued
 *       400:
 *         description: Invalid OTP or session
 */
const verifyOtp = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId, role, mobileNumber, code } = req.body;

    // Validate required fields
    validateRequiredFields(req.body, [
      "sessionId",
      "role",
      "mobileNumber",
      "code",
    ]);
    if (!["customer", "vendor"].includes(role)) {
      throw new BadRequestError("Invalid role");
    }

    const sessionKey = `signup:${role}:${sessionId}`;
    const data = await redisClient?.get(sessionKey);
    if (!data) {
      throw new BadRequestError("Invalid or expired session");
    }

    const verification = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: mobileNumber, code });

    if (verification.status !== "approved") {
      throw new BadRequestError("Invalid OTP");
    }

    const userData = JSON.parse(data);
    let user = null;
    if (role === "customer") {
      user = new CustomerModel(userData);
    } else {
      user = new VendorModel(userData);
    }
    await user.save();

    const token = generateJwtToken(
      user._id.toString(),
      role as "customer" | "vendor"
    );
    await redisClient?.del(sessionKey);

    await AuditLogModel.create({
      action: `${role}_created`,
      performedBy: user._id,
      targetId: user._id,
      details: { mobileNumber },
    });

    logger.info(`${role} signup completed: ${mobileNumber}`, {
      userId: user._id,
      requestId: req.requestId,
    });
    res.status(200).json({ token, user });
  } catch (error) {
    logger.error("OTP verification failed", {
      error,
      requestId: req.requestId,
    });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login/customer:
 *   post:
 *     summary: Login customer with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *             properties:
 *               mobileNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *       404:
 *         description: Customer not found
 */
const loginCustomer = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobileNumber } = req.body;

    validateRequiredFields(req.body, ["mobileNumber"]);

    const customer = await CustomerModel.findOne({ mobileNumber });
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    const sessionId = uuidv4();
    await redisClient?.setex(
      `login:customer:${sessionId}`,
      600,
      customer._id.toString()
    );

    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
      });

    logger.info(`Customer login initiated: ${mobileNumber}`, {
      sessionId,
      requestId: req.requestId,
    });
    res.status(200).json({ sessionId, message: "OTP sent to mobile number" });
  } catch (error) {
    logger.error("Customer login failed", { error, requestId: req.requestId });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login/vendor:
 *   post:
 *     summary: Login vendor with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobileNumber
 *             properties:
 *               mobileNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 *       404:
 *         description: Vendor not found
 */
const loginVendor = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mobileNumber } = req.body;

    validateRequiredFields(req.body, ["mobileNumber"]);

    const vendor = await VendorModel.findOne({ mobileNumber });
    if (!vendor) {
      throw new NotFoundError("Vendor not found");
    }
    if (vendor.status !== "approved") {
      throw new BadRequestError("Vendor account is not approved");
    }

    const sessionId = uuidv4();
    await redisClient?.setex(
      `login:vendor:${sessionId}`,
      600,
      vendor._id.toString()
    );

    await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
      });

    logger.info(`Vendor login initiated: ${mobileNumber}`, {
      sessionId,
      requestId: req.requestId,
    });
    res.status(200).json({ sessionId, message: "OTP sent to mobile number" });
  } catch (error) {
    logger.error("Vendor login failed", { error, requestId: req.requestId });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login/admin:
 *   post:
 *     summary: Login admin with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token issued
 *       401:
 *         description: Invalid credentials
 */
const loginAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    validateRequiredFields(req.body, ["email", "password"]);

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = generateJwtToken(admin._id.toString(), "admin");
    logger.info(`Admin login successful: ${email}`, {
      requestId: req.requestId,
    });
    res.status(200).json({ token, user: { email, role: admin.role } });
  } catch (error) {
    logger.error("Admin login failed", { error, requestId: req.requestId });
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login/verify-otp:
 *   post:
 *     summary: Verify OTP and complete login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - role
 *               - mobileNumber
 *               - code
 *             properties:
 *               sessionId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, vendor]
 *               mobileNumber:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login completed, JWT token issued
 *       400:
 *         description: Invalid OTP or session
 */
const verifyLoginOtp = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId, role, mobileNumber, code } = req.body;

    validateRequiredFields(req.body, [
      "sessionId",
      "role",
      "mobileNumber",
      "code",
    ]);
    if (!["customer", "vendor"].includes(role)) {
      throw new BadRequestError("Invalid role");
    }

    const sessionKey = `login:${role}:${sessionId}`;
    const userId = await redisClient?.get(sessionKey);
    if (!userId) {
      throw new BadRequestError("Invalid or expired session");
    }

    const verification = await twilioClient.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: mobileNumber, code });

    if (verification.status !== "approved") {
      throw new BadRequestError("Invalid OTP");
    }

    let user = null;
    if (role === "customer") {
      user = await CustomerModel.findById(userId).select("-__v");
    } else {
      user = await VendorModel.findById(userId).select("-__v");
    }

    if (!user) {
      throw new NotFoundError(`${role} not found`);
    }

    const token = generateJwtToken(userId, role as "customer" | "vendor");
    await redisClient?.del(sessionKey);

    await AuditLogModel.create({
      action: `${role}_login`,
      performedBy: userId,
      details: { mobileNumber },
    });

    logger.info(`${role} login completed: ${mobileNumber}`, {
      userId,
      requestId: req.requestId,
    });
    res.status(200).json({ token, user });
  } catch (error) {
    logger.error("Login OTP verification failed", {
      error,
      requestId: req.requestId,
    });
    next(error);
  }
};

export {
  signupCustomer,
  signupVendor,
  signupAdmin,
  verifyOtp,
  loginCustomer,
  loginVendor,
  loginAdmin,
  verifyLoginOtp,
};
