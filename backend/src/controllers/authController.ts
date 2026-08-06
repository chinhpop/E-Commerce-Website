import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

export const register = async (
  req: express.Request & { body: RegisterBody },
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email và password là bắt buộc",
      });
      return;
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
      return;
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role === "admin" ? "user" : role,
    });

    const accessToken = generateAccessToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString());

    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
      return;
    }

    next(error);
  }
};

export const login = async (
  req: express.Request & { body: LoginBody },
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
      });
      return;
    }

    const user = (await User.findOne({
      email: email.toLowerCase(),
    }).select("+password")) as (IUser & { comparePassword(password: string): Promise<boolean> }) | null;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: express.Request & { body: RefreshBody },
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Thiếu refresh token",
      });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is missing.");
    }

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(refreshToken, secret) as JwtPayload;
    } catch {
      res.status(403).json({
        success: false,
        message: "Refresh token hết hạn hoặc không hợp lệ",
      });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({
        success: false,
        message: "Refresh token không hợp lệ",
      });
      return;
    }

    const newAccessToken = generateAccessToken(user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: express.Request & { body: RefreshBody },
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Thiếu refresh token",
      });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET;

    if (secret) {
      try {
        const decoded = jwt.verify(refreshToken, secret) as JwtPayload;
        await User.findByIdAndUpdate(decoded.id, {
          refreshToken: null,
        });
      } catch {
        // ignore
      }
    }

    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    next(error);
  }
};