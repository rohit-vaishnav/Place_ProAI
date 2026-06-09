import logger from "../utils/logger.js";
import { fail } from "../utils/apiResponse.js";

export function notFoundHandler(req, res) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err.name === "ValidationError") {
    return fail(res, "Validation failed", 400, err.errors);
  }

  if (err.name === "CastError") {
    return fail(res, "Invalid resource identifier", 400);
  }

  if (err.code === 11000) {
    return fail(res, "Duplicate entry — resource already exists", 409);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return fail(res, "Invalid or expired authentication token", 401);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  return fail(res, message, statusCode, err.errors || null);
}
