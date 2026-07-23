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

    // 5. Trả về response, KHÔNG bao giờ trả password ra ngoài
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