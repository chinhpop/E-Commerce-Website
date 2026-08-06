import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Tất cả routes giỏ hàng đều yêu cầu đăng nhập
router.use(protect);

router.get("/", getCart as any);
router.post("/", addToCart as any);
router.put("/:productId", updateCartItem as any);
router.delete("/:productId", removeFromCart as any);
router.delete("/", clearCart as any);

export default router;