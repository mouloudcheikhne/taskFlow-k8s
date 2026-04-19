import mongoose from "mongoose";
import dotenv from "dotenv";
import CustomException from "../exeception/custumException.js";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw new CustomException(error.message, 500);
  }
};
export default connectDB;
