import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    await mongoose.connect(mongoUri as string);
    console.log("MongoDB Connected");
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB Connection Error:", error.message);
    } else {
      console.error("MongoDB Connection Error:", error);
    }

    process.exit(1);
  }
};

export default connectDB;