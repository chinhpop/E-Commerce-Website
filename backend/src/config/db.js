import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGDB_URI);
    console.log("MongoDB Connected");
  }catch(error){
    console.error("MongDB Connection Error", error.message);
    process.exit(1);
  }
};
export default connectDB;