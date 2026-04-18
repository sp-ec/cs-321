import mongoose from "mongoose";
const MONGO_URI =
  "mongodb+srv://noahmartineau8_db_user:zslGOTEh0LfOKsD7@cluster0.tau5xgr.mongodb.net/?appName=Cluster0";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed.");
};

export const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    await closeDB();
    console.log("Cleanup complete. Exiting.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};
