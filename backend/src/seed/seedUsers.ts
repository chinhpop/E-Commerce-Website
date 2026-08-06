import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Dữ liệu mẫu
const adminData = {
  name: "Admin System",
  email: "admin@ecommerce.com",
  password: "Admin@123",
  role: "admin",
};

const sellersData = [
  { name: "Nguyễn Văn Seller", email: "seller1@ecommerce.com", password: "Seller@123", role: "seller" },
  { name: "Trần Thị Seller", email: "seller2@ecommerce.com", password: "Seller@123", role: "seller" },
  { name: "Lê Văn Seller", email: "seller3@ecommerce.com", password: "Seller@123", role: "seller" },
  { name: "Phạm Thị Seller", email: "seller4@ecommerce.com", password: "Seller@123", role: "seller" },
  { name: "Hoàng Văn Seller", email: "seller5@ecommerce.com", password: "Seller@123", role: "seller" },
];

const usersData = [
  { name: "Nguyễn Văn A", email: "user1@ecommerce.com", password: "User@123", role: "user" },
  { name: "Trần Thị B", email: "user2@ecommerce.com", password: "User@123", role: "user" },
  { name: "Lê Văn C", email: "user3@ecommerce.com", password: "User@123", role: "user" },
  { name: "Phạm Thị D", email: "user4@ecommerce.com", password: "User@123", role: "user" },
  { name: "Hoàng Văn E", email: "user5@ecommerce.com", password: "User@123", role: "user" },
];

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGDB_URI;
    if (!mongoUri) {
      throw new Error("MONGDB_URI is not defined in environment variables.");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Kết nối MongoDB thành công");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Lỗi kết nối MongoDB:", error.message);
    } else {
      console.error("❌ Lỗi kết nối MongoDB:", error);
    }
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Xóa toàn bộ user cũ có email trùng với data mẫu (tránh lỗi duplicate key
    // khi chạy script nhiều lần). KHÔNG dùng deleteMany({}) để tránh xóa
    // nhầm dữ liệu thật nếu bạn đã có user đăng ký thủ công trong DB.
    const allEmails = [
      adminData.email,
      ...sellersData.map((s) => s.email),
      ...usersData.map((u) => u.email),
    ];
    const { deletedCount } = await User.deleteMany({ email: { $in: allEmails } });
    if (deletedCount > 0) {
      console.log(`🗑️  Đã xóa ${deletedCount} user mẫu cũ (nếu có)`);
    }

    // Dùng User.create() (không phải insertMany) để trigger pre-save hook
    // hash password cho từng document
    const admin = await User.create(adminData);
    console.log(`✅ Tạo admin: ${admin.email}`);

    const sellers = await User.create(sellersData);
    console.log(`✅ Tạo ${sellers.length} seller`);

    const users = await User.create(usersData);
    console.log(`✅ Tạo ${users.length} user thường`);

    console.log("\n🎉 Seed dữ liệu thành công!");
    console.log("─────────────────────────────");
    console.log(`Admin:   ${adminData.email} / ${adminData.password}`);
    console.log(`Sellers: seller1..5@ecommerce.com / ${sellersData[0].password}`);
    console.log(`Users:   user1..5@ecommerce.com / ${usersData[0].password}`);
    console.log("─────────────────────────────");

    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Lỗi khi seed dữ liệu:", error.message);
    } else {
      console.error("❌ Lỗi khi seed dữ liệu:", error);
    }
    process.exit(1);
  }
};

seedUsers();