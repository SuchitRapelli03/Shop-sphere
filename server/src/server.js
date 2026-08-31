import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Check required Razorpay environment variables
if (!process.env.RAZORPAY_KEY_ID) {
  console.warn("WARNING: RAZORPAY_KEY_ID is not configured");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.warn("WARNING: RAZORPAY_KEY_SECRET is not configured");
}

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});