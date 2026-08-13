import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

const email = process.env.VENDOR_EMAIL;
const password = process.env.VENDOR_PASSWORD;
const name = process.env.VENDOR_NAME || "ShopSphere Vendor";

if (!email || !password) {
  console.error("VENDOR_EMAIL and VENDOR_PASSWORD must be set in the environment.");
  process.exit(1);
}

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

  console.log(`Vendor account ready: ${email}`);
} catch (error) {
  console.error("Error:", error);
} finally {
  await mongoose.disconnect();
}