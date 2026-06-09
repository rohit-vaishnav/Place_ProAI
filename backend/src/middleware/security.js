import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import env from "../config/env.js";

export function applySecurityMiddleware(app) {
  app.use(helmet());
  app.use(cors({
    origin: env.corsOrigin,
    credentials: true,
  }));

  const limiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });

  app.use("/api", limiter);
}
