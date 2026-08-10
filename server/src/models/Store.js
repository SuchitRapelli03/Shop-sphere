import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    logo: String,
    banner: String,
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" }
  },
  { timestamps: true }
);

export default mongoose.model("Store", storeSchema);
