import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
{
options: {
type: Map,
of: String,
required: true,
},

price: {
  type: Number,
  required: true,
  min: 0,
},

stock: {
  type: Number,
  required: true,
  min: 0,
  default: 0,
},

},
{
_id: true,
}
);

const productSchema = new mongoose.Schema(
{
storeId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Store",
required: true,
index: true,
},

vendorId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  index: true,
},

name: {
  type: String,
  required: true,
  trim: true,
},

description: String,

// Legacy/default product price.
// Used by products without variants.
price: {
  type: Number,
  required: true,
  min: 0,
},

// Legacy/default product stock.
// Used by products without variants.
stock: {
  type: Number,
  required: true,
  min: 0,
  default: 0,
},

category: {
  type: String,
  trim: true,
},

subcategory: {
  type: String,
  trim: true,
},

images: [String],

// Products with variants use the selected variant's
// price and stock during cart/checkout.
variants: {
  type: [variantSchema],
  default: [],
},

active: {
  type: Boolean,
  default: true,
  index: true,
},

},
{
timestamps: true,
}
);

productSchema.index({
storeId: 1,
active: 1,
});

productSchema.index({
storeId: 1,
category: 1,
active: 1,
});

export default mongoose.model("Product", productSchema);
