import mongoose from "mongoose";

const connectDB = async () => {
    try {
      console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
      await mongoose.connect(`${process.env.MONGODB_URI}/kanban`);
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      process.exit(1);
    }
  };


export default connectDB;