import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, min: 1, required: true }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
