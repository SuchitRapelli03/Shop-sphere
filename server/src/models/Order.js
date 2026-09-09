import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    /*
    ---------------------------------------------------------
    VARIANT SNAPSHOT
    ---------------------------------------------------------
    variantId identifies the exact variant purchased.

    variantOptions stores the option values at the time of
    purchase so historical orders remain understandable even
    if the product's variants are changed later.
    ---------------------------------------------------------
    */

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    variantOptions: {
      type: Map,
      of: String,
      default: undefined,
    },

    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
    Price actually paid for ONE unit of this order item.
    This is a snapshot and must come from the server.
    */

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

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

    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: [
        "PLACED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    stripeSessionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  customerId: 1,
  createdAt: -1,
});

orderSchema.index({
  vendorId: 1,
  status: 1,
});

export default mongoose.model("Order", orderSchema);