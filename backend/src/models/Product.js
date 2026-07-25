import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên sản phẩm"],
      trim: true,
      maxlength: [150, "Tên sản phẩm không được vượt quá 150 ký tự"],
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả sản phẩm"],
      maxlength: [2000, "Mô tả không được vượt quá 2000 ký tự"],
    },
    category: {
      type: String,
      required: [true, "Vui lòng chọn danh mục"],
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Vui lòng nhập giá sản phẩm"],
      min: [0, "Giá không được âm"],
    },
    stock: {
      type: Number,
      required: [true, "Vui lòng nhập số lượng tồn kho"],
      min: [0, "Số lượng không được âm"],
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // dùng nếu upload qua Cloudinary
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true, // cho phép "ẩn" sản phẩm thay vì xóa cứng
    },
  },
  { timestamps: true }
);

// Index cho tìm kiếm full-text theo tên + lọc nhanh theo category
productSchema.index({ name: "text", category: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;