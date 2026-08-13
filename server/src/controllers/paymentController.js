import Razorpay from "razorpay";
import crypto from "crypto";
import Cart from "../models/Cart.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function createRazorpayOrder(req, res) {
  try {
    const cart = await Cart.findOne({
      customerId: req.user._id
    }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    let total = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (!product || !product.active) {
        return res.status(400).json({
          message: "One or more products are no longer available"
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      total += product.price * item.quantity;
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    res.status(500).json({
      message: "Unable to create Razorpay order"
    });
  }
}

export async function verifyRazorpayPayment(req, res) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing Razorpay payment details"
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature"
      });
    }

    res.json({
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);

    res.status(500).json({
      message: "Payment verification failed"
    });
  }
}