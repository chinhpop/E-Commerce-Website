import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
connectDB();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "Service is running"
    });
});
app.get("/health", (_req, res)=>{
   res.json({ ok: true }); 
});
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});