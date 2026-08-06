import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

// Dữ liệu mẫu theo từng category — để tên/giá thực tế hơn thay vì random chữ cái
const productTemplates = {
  clothing: [
    { name: "Áo thun thể thao Nike Dri-FIT", price: 299000 },
    { name: "Quần short chạy bộ Adidas", price: 349000 },
    { name: "Áo khoác gió chống nước", price: 549000 },
    { name: "Legging tập gym nữ co giãn 4 chiều", price: 259000 },
    { name: "Áo tank top tập gym nam", price: 189000 },
    { name: "Bộ đồ yoga 2 món", price: 399000 },
  ],
  supplements: [
    { name: "Whey Protein Optimum Nutrition 2lbs", price: 1290000 },
    { name: "Creatine Monohydrate 300g", price: 450000 },
    { name: "BCAA 2:1:1 Xtend 30 servings", price: 690000 },
    { name: "Multivitamin tổng hợp 60 viên", price: 320000 },
    { name: "Pre-workout C4 Original", price: 590000 },
    { name: "Collagen Peptide bột 500g", price: 750000 },
  ],
  equipment: [
    { name: "Tạ tay điều chỉnh 20kg (cặp)", price: 1590000 },
    { name: "Thảm tập yoga chống trượt 6mm", price: 259000 },
    { name: "Dây kháng lực set 5 mức độ", price: 199000 },
    { name: "Bóng tập gym Swiss ball 65cm", price: 289000 },
    { name: "Ghế tập bụng AB Roller", price: 890000 },
    { name: "Xà đơn treo cửa đa năng", price: 450000 },
  ],
  accessories: [
    { name: "Găng tay tập gym chống trơn", price: 149000 },
    { name: "Bình nước thể thao 1L có vạch chia", price: 129000 },
    { name: "Đai lưng tập gym hỗ trợ cột sống", price: 349000 },
    { name: "Băng quấn cổ tay tập gym", price: 79000 },
    { name: "Túi đựng đồ tập gym chống nước", price: 259000 },
    { name: "Đồng hồ đo nhịp tim thể thao", price: 990000 },
  ],
  footwear: [
    { name: "Giày chạy bộ Nike Revolution 6", price: 1290000 },
    { name: "Giày tập gym Adidas Dropset", price: 1590000 },
    { name: "Giày cross-training Reebok Nano", price: 1890000 },
    { name: "Dép sandal phục hồi sau tập", price: 390000 },
  ],
};

const descriptions = [
  "Sản phẩm chính hãng, chất lượng cao, phù hợp cho người tập luyện mọi cấp độ.",
  "Thiết kế hiện đại, chất liệu bền bỉ, được kiểm định an toàn trước khi phân phối.",
  "Hỗ trợ tối ưu hiệu suất tập luyện, form dáng thoải mái suốt buổi tập.",
  "Được nhiều vận động viên và huấn luyện viên tin dùng, bảo hành chính hãng.",
  "Chất liệu cao cấp, thấm hút mồ hôi tốt, phù hợp cho cả nam và nữ.",
];

// Random 1 phần tử trong mảng
const randomItem = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Random số nguyên trong khoảng [min, max]
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

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

const seedProducts = async () => {
  try {
    await connectDB();

    // 1. Lấy danh sách seller đã tạo từ seedUsers.js
    const sellers = await User.find({ role: "seller" });

    if (sellers.length === 0) {
      console.error("❌ Không tìm thấy seller nào trong DB. Hãy chạy `npm run seed` (seedUsers) trước.");
      process.exit(1);
    }
    console.log(`🔎 Tìm thấy ${sellers.length} seller`);

    // 2. Xóa toàn bộ sản phẩm cũ do các seller này tạo (tránh trùng lặp khi chạy lại script)
    const sellerIds = sellers.map((s) => s._id);
    const { deletedCount } = await Product.deleteMany({ seller: { $in: sellerIds } });
    if (deletedCount > 0) {
      console.log(`🗑️  Đã xóa ${deletedCount} sản phẩm mẫu cũ`);
    }

    // 3. Build danh sách sản phẩm từ templates, random gán seller
    const categories = Object.keys(productTemplates) as Array<keyof typeof productTemplates>;
    const productsToCreate: Array<any> = [];

    categories.forEach((category) => {
      productTemplates[category].forEach((template) => {
        productsToCreate.push({
          name: template.name,
          description: randomItem(descriptions),
          category,
          price: template.price,
          stock: randomInt(5, 100),
          images: [
            {
              url: `https://placehold.co/600x400?text=${encodeURIComponent(
                template.name.split(" ").slice(0, 2).join(" ")
              )}`,
            },
          ],
          seller: randomItem(sellers)._id, // random gán cho 1 trong 5 seller
          ratings: {
            average: parseFloat((Math.random() * 2 + 3).toFixed(1)), // random 3.0 - 5.0
            count: randomInt(0, 200),
          },
        });
      });
    });

    // 4. Tạo hàng loạt — dùng insertMany vì product không có logic hash
    //    như password, không cần trigger middleware save
    const createdProducts = await Product.insertMany(productsToCreate);

    console.log(`✅ Tạo thành công ${createdProducts.length} sản phẩm`);

    // 5. Thống kê nhanh theo category để confirm dữ liệu đa dạng
    const statsByCategory: Record<string, number> = {};
    createdProducts.forEach((p) => {
      statsByCategory[p.category] = (statsByCategory[p.category] || 0) + 1;
    });

    console.log("\n📊 Thống kê theo category:");
    console.log("─────────────────────────────");
    Object.entries(statsByCategory).forEach(([cat, count]) => {
      console.log(`${cat.padEnd(15)} : ${count} sản phẩm`);
    });
    console.log("─────────────────────────────");

    // 6. Thống kê theo seller
    const statsBySeller: Record<string, number> = {};
    createdProducts.forEach((p) => {
      const sellerId = p.seller.toString();
      statsBySeller[sellerId] = (statsBySeller[sellerId] || 0) + 1;
    });

    console.log("\n📊 Thống kê theo seller:");
    console.log("─────────────────────────────");
    sellers.forEach((s) => {
      const count = statsBySeller[s._id.toString()] || 0;
      console.log(`${s.name.padEnd(25)} : ${count} sản phẩm`);
    });
    console.log("─────────────────────────────");

    console.log("\n🎉 Seed sản phẩm thành công!");
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Lỗi khi seed sản phẩm:", error.message);
    } else {
      console.error("❌ Lỗi khi seed sản phẩm:", error);
    }
    process.exit(1);
  }
};

seedProducts();