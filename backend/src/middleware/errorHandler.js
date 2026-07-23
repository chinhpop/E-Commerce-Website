// Global error handler — luôn đặt SAU tất cả route trong server.js
// Express nhận diện đây là error handler nhờ có 4 tham số (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi server nội bộ";

  // Lỗi validate của Mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Lỗi trùng key (unique) của MongoDB
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} đã tồn tại`;
  }

  // Lỗi ObjectId không hợp lệ
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Giá trị không hợp lệ cho field: ${err.path}`;
  }

  // Lỗi JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token đã hết hạn";
  }

  res.status(statusCode).json({
    success: false,
    message,
    // chỉ show stack trace khi đang dev, tránh lộ thông tin ở production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;