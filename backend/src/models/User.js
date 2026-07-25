import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // tạo index unique ở tầng DB, tránh trùng email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // mặc định không trả password khi query, phải .select("+password") nếu cần
    },
    role: {
      type: String,
      enum: ["user","seller" ,"admin"],
      default: "user",
    },
    refreshToken: { 
      type: String, default: null 
    },
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
  }
);

// Pre-save hook: chỉ hash lại password nếu nó bị thay đổi (tạo mới hoặc update password)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method instance để so sánh password khi login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);