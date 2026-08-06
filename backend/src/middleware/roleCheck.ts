import express from "express";

export const authorize = (...roles: string[]) => {
  return (req: express.Request & { user?: { role?: string } }, res: express.Response, next: express.NextFunction) => {
    // Middleware này PHẢI chạy sau protect, vì cần req.user đã được gắn sẵn
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Chưa xác thực người dùng",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' không có quyền thực hiện hành động này`,
      });
    }

    next();
  };
};