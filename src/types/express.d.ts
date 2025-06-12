// types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: any;
        role: "customer" | "vendor" | "admin";
        mobileNumber?: string;
        email?: string;
      };
      requestId?: string;
    }
  }
}
