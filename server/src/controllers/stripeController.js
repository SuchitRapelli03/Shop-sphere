import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import stripe from "../utils/stripe.js";

export async function createStripeCheckoutSession(req, res) {
  try {
    if (!stripe) {
      return res.status(503).json({
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY."
      });
    }

    const cart = await Cart.findOne({
      customerId: req.user._id
    }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    const lineItems = cart.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name
        },
        unit_amount: Math.round(item.productId.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      customer_email: req.user.email,
      metadata: {
        customerId: req.user._id.toString()
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    res.status(500).json({
      message: "Unable to create Stripe checkout session"
    });
  }
}