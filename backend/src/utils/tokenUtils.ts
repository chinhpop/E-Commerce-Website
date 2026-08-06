import jwt from "jsonwebtoken";

// Access token: sống ngắn (vd 15p), dùng để xác thực request
export const generateAccessToken = (userId: string) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return jwt.sign({ id: userId }, secret as any, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  } as any);
};

// Refresh token: sống dài (vd 7 ngày), dùng để cấp lại access token mới
export const generateRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign({ id: userId }, secret as any, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as any);
};