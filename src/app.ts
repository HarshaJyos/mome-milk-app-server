import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createNamespace } from "cls-hooked";
import { v4 as uuidv4 } from "uuid";
import { errorHandler } from "./errorMiddleware";
import { connectMongoDB } from "./database";
import routes from "./routes"; // adjust path as needed
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json";

dotenv.config();

// Initialize Express app
const app: Express = express();

// Initialize CLS namespace for request ID tracing
const requestNamespace = createNamespace("request");
app.use((req: Request, res: Response, next: NextFunction) => {
  requestNamespace.run(() => {
    requestNamespace.set("requestId", uuidv4());
    next();
  });
});

// Trust proxy for production
app.set("trust proxy", 1);

// Custom sanitization middleware to prevent MongoDB injection
const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      } else if (typeof obj[key] === "string") {
        obj[key] = obj[key].replace(/[$][\w]+/g, "");
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
app.use(sanitizeInput);

// Morgan logging with request ID
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms [request-id: :req[requestId]]"
  )
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later.",
    });
  },
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? JSON.parse(process.env.ALLOWED_ORIGINS)
  : [
      "http://localhost:3000",
      "https://salmon-tree-0c1a1a96f1e.6.azurestaticapps.net",
    ];
app.use(
  cors({
    origin: (origin: string | undefined, callback: any) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "requestId-id",
    ],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 200,
  })
);

console.log("Allowed Origins:", allowedOrigins);

// Connect to MongoDB before routes
connectMongoDB().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Milk App API");
});
app.use("/api", routes);

// Swagger UI and JSON endpoints
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api-docs-json", (req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// Error handling middleware
app.use(errorHandler);

export default app;
