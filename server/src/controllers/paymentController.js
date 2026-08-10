import Stripe from "stripe";
import Cart from "../models/Cart.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function createCheckoutSession(req, res) {
  if (!stripe) return res.status(503).json({ message: "Stripe is not configured" });

  const cart = await Cart.findOne({ customerId: req.user._id }).populate("items.productId");
  if (!cart || !cart.items.length) return res.status(400).json({ message: "Cart is empty" });

  const line_items = cart.items.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: { name: item.productId.name },
      unit_amount: Math.round(item.productId.price * 100)
    },
    quantity: item.quantity
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${process.env.CLIENT_URL}/checkout/success`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    customer_email: req.user.email
  });

  res.json({ url: session.url });
}
