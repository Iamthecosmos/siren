function errorHandler(err, req, res, next) {
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large",
      message: "The uploaded file exceeds the maximum size limit",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      error: "Unexpected file",
      message: "Unexpected file field or too many files uploaded",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      message: err.message,
      details: err.details,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided authentication token is invalid",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "The authentication token has expired",
    });
  }

  // Database errors
  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
    });
  }

  if (err.code && err.code.startsWith("SQLITE_")) {
    return res.status(500).json({
      error: "Database error",
      message: "A database error occurred while processing your request",
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.error || "Application error",
      message: err.message,
    });
  }

  // Default server error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred. Please try again later.",
  });
}

class AppError extends Error {
  constructor(message, statusCode, error = "Application error") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.name = "AppError";
  }
}

module.exports = {
  errorHandler,
  AppError,
};
