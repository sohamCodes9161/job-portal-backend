import dotenv from "dotenv";
dotenv.config(); // ✅ FIRST

import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { connectCloudinary } from "./src/utils/cloudinary.js";

connectDB();
connectCloudinary(); // 🔥 NOW it runs AFTER env is loaded

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});