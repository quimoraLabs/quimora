export const errorHandler = (err, req, res, next) => {
  // 1. Console log for debugging
  console.error("DEBUG ERROR ❌:", err.message);

  // 2. Dynamic Status Code (Helper se aayega ya default 500)
  const statusCode = err.statusCode || 500;

  // 3. Response bhej do
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Dev mode mein stack trace bhi dekh sakte hain (Optional)
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

