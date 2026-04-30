import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Feyza changed this to support either env name from different setups.
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      // Feyza changed this to show a direct fix instead of a vague crash.
      throw new Error("Missing Mongo URI. Add MONGO_URI in backend/.env");
    }

    const conn = await mongoose.connect(mongoUri);
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
