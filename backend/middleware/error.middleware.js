/**
 * Global Enterprise Error Handling Middleware.
 * Intercepts all runtime exceptions, database driver violations, and schema constraint failures.
 */
import config from "../config/config.js";

export const errorHandler = (err, req, res, next) => {
  // 1. Structural clone of the error object to retain operational custom traits
  let error = { ...err };
  error.message = err.message;

  // Log full stack diagnostic trace in terminal for developmental debugging
  console.error("DEBUG ERROR ❌:", err.stack || err.message);

  // 2. Intercept Mongoose Invalid ObjectId Structure (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid field: ${err.path}`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // 3. Intercept MongoDB Duplicate Field Key Violations (Code 11000)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for field: '${duplicateField}'. Please use another value.`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // 4. Intercept Mongoose Schema Internal Validation Constraints (ValidationError)
  if (err.name === "ValidationError") {
    // Flatten array message details to display all missing/invalid fields at once
    const message = Object.values(err.errors).map((val) => val.message).join(", ");
    error = new Error(message);
    error.statusCode = 400;
  }

  // 5. Finalize status configuration assignment (Resolves custom status code or safe defaults to 500)
  const statusCode = error.statusCode || 500;
  const operationalMessage = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: operationalMessage,
    // Safely limits infrastructure footprint metadata exposure only to developer instances
    stack: config.nodeENV === "development" ? err.stack : undefined,
  });
};
