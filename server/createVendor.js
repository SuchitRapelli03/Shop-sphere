import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

const email = "vendor@shopsphere.com";
const password = "Vendor@123";
const name = "ShopSphere Vendor";

try {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "VENDOR";
    await existing.save();
    console.log("Existing user promoted to VENDOR.");
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "VENDOR"
    });

    console.log("Vendor account created.");
  }

  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
} catch (error) {
  console.error("Error:", error);
} finally {
  await mongoose.disconnect();
}