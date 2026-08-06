import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Không có token, truy cập bị từ chối",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        message: "User không tồn tại",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: "Access token đã hết hạn",
      });
      return;
    }

    res.status(401).json({
      message: "Token không hợp lệ",
    });
  }
};