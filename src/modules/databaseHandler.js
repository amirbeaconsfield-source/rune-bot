import mongoose from "mongoose";

export class DatabaseHandler {
  constructor(options = {}) {
    this.mongoUri = options.mongoUri || process.env.MONGO_URI;
  }

  async connect() {
    if (!this.mongoUri) {
      console.warn("⚠️  MONGO_URI not provided. Database will not connect.");
      return false;
    }

    try {
      await mongoose.connect(this.mongoUri, {
        retryWrites: true,
        w: "majority",
      });
      console.log("✅ Database connected!");
      return true;
    } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}
