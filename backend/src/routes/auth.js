import express from "express";
import { register, login, refreshToken, logout } from "../controllers/authControllers.js";
import { protect } from "../middleware/auth.js"

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});
export default router;