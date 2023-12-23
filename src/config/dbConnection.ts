import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI as string, {});
    console.log("DB Online");
  } catch (error) {
    console.log(error);
    throw new Error("Error connecting to DB");
  }
};

export default dbConnection;
