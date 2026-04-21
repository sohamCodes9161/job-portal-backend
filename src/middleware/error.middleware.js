export const errorMiddleware = (err, req, res, next) => {
  console.error("🔥 ERROR:", err); // FULL ERROR
  console.error("MESSAGE:", err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};