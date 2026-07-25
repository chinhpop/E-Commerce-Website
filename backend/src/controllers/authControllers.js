import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenUtils.js";

// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate input cơ bản
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email và password là bắt buộc",
      });
    }

    // 2. Validate email chưa tồn tại
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // 3. Tạo user mới (password sẽ tự hash nhờ pre-save hook trong model)
    const newUser = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "user" : role, // tránh cho client tự đăng ký làm admin
    });

    // 4. Sinh token
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    // 5. Lưu refreshToken vào DB — bắt buộc, nếu không thì /refresh và /logout
    //    sẽ không hoạt động được vì không có gì để đối chiếu
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // 6. Trả về response, KHÔNG bao giờ trả password ra ngoài
    return res.status(201).json({
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
  } catch (error) {
    // Bắt lỗi trùng key (E11000) từ MongoDB nếu 2 request race nhau
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }
    next(error); // đẩy qua errorHandler global
  }
};

// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
      });
    }

    // password có select: false trong schema nên phải chỉ định lấy thêm
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    // Không tách riêng 2 thông báo "email không tồn tại" / "sai password"
    // để tránh lộ thông tin email nào đã đăng ký (bảo mật)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Lưu refreshToken mới vào DB — ghi đè token cũ (nếu có)
    // Điều này cũng có nghĩa: login ở thiết bị mới sẽ vô hiệu hoá
    // refreshToken ở thiết bị cũ (single-session refresh token).
    // Nếu muốn hỗ trợ nhiều thiết bị đăng nhập cùng lúc, cần đổi
    // sang lưu mảng refreshTokens thay vì 1 chuỗi.
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
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

// @route   POST /api/auth/refresh
// @access  Public (nhưng cần refreshToken hợp lệ)
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Thiếu refresh token",
      });
    }

    // 1. Verify chữ ký + hạn của refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Refresh token hết hạn hoặc không hợp lệ",
      });
    }

    // 2. Đối chiếu với DB — đây là bước cho phép "thu hồi" token khi logout
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token không hợp lệ",
      });
    }

    // 3. Cấp access token mới
    const newAccessToken = generateAccessToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Cấp access token mới thành công",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/logout
// @access  Public (nhưng cần refreshToken hợp lệ)
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Thiếu refresh token",
      });
    }

    // Không cần verify chữ ký nghiêm ngặt ở đây — chỉ cần decode
    // để lấy id user, rồi xoá refreshToken trong DB.
    // Nếu token đã hết hạn hoặc sai, vẫn coi như logout thành công
    // (client sẽ tự xoá token phía mình, không có gì để mất).
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    } catch (err) {
      // ignore — token không hợp lệ thì cũng không có gì để revoke
    }

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    next(error);
  }
};