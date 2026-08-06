import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: "Service is running",
  });
});

app.get("/health", (_req: express.Request, res: express.Response) => {
  res.json({ ok: true });
});

try {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
}

app.use(errorHandler);