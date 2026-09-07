import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, trim: true,},
    subcategory: { type: String, trim: true,},
    images: [String],
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

productSchema.index({ storeId: 1, active: 1 });
productSchema.index({ storeId: 1, category: 1, active: 1 });
export default mongoose.model("Product", productSchema);
