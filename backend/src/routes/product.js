import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Private routes — cần đăng nhập + đúng role
router.post("/", protect, authorize("seller", "admin"), createProduct);
router.put("/:id", protect, updateProduct); // check owner nằm trong controller
router.delete("/:id", protect, deleteProduct); // check owner nằm trong controller

export default router;