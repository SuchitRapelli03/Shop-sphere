import Razorpay from "razorpay";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import stripe from "../utils/stripe.js";
import {
  validateCart,
  createOrderFromCart,
} from "../services/orderService.js";

/* =========================================================
   STRIPE CHECKOUT
========================================================= */

export async function createStripeCheckout(req, res) {
  try {
    const cart = await Cart.findOne({
      customerId: req.user._id,
    }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const lineItems = [];

    for (const item of cart.items) {
      const product = item.productId;

      if (!product || !product.active) {
        return res.status(400).json({
          message:
            "One or more products are no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}`,
        });
      }

      lineItems.push({
        price_data: {
          currency: "inr",

          product_data: {
            name: product.name,
            description:
              product.description || undefined,
          },

          unit_amount:
            Math.round(product.price * 100),
        },

        quantity: item.quantity,
      });
    }

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: lineItems,

        customer_email: req.user.email,

        phone_number_collection: {
          enabled: true,
        },

        shipping_address_collection: {
          allowed_countries: ["IN"],
        },

        metadata: {
          customerId:
            req.user._id.toString(),
        },

        success_url:
          `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.CLIENT_URL}/cart`,
      });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error(
      "STRIPE CHECKOUT CREATION ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Unable to create Stripe checkout",
    });
  }
}


/* =========================================================
   CREATE ORDER FROM STRIPE SESSION
========================================================= */

async function createOrderFromStripeSession(
  session
) {
  const existingOrder =
    await Order.findOne({
      stripeSessionId: session.id,
    });

  if (existingOrder) {
    console.log(
      `Order already exists for Stripe session ${session.id}`
    );

    return existingOrder;
  }

  const customerId =
    session.metadata?.customerId;

  if (!customerId) {
    throw new Error(
      "Stripe session is missing customerId"
    );
  }

  /*
  ---------------------------------------------------------
  Get delivery details from Stripe
  ---------------------------------------------------------
  */

  const shipping =
    session.shipping_details;

  const shippingAddress = {
    fullName:
      shipping?.name ||
      session.customer_details?.name ||
      "Customer",

    phone:
      session.customer_details?.phone ||
      "Not provided",

    addressLine:
      shipping?.address?.line1 ||
      "Not provided",

    city:
      shipping?.address?.city ||
      "Not provided",

    state:
      shipping?.address?.state ||
      "Not provided",

    pincode:
      shipping?.address?.postal_code ||
      "Not provided",
  };

  /*
  ---------------------------------------------------------
  Create order using central order service
  ---------------------------------------------------------
  */

  const order =
    await createOrderFromCart({
      customerId,

      shippingAddress,

      paymentStatus: "PAID",

      stripeSessionId:
        session.id,
    });

  console.log(
    `Stripe order created: ${order._id}`
  );

  return order;
}


/* =========================================================
   STRIPE WEBHOOK
========================================================= */

export async function handleStripeWebhook(
  req,
  res
) {
  const signature =
    req.headers["stripe-signature"];

  let event;

  try {
    event =
      stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
  } catch (error) {
    console.error(
      "STRIPE WEBHOOK SIGNATURE ERROR:",
      error.message
    );

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object;

        if (
          session.payment_status !==
          "paid"
        ) {
          break;
        }

        await createOrderFromStripeSession(
          session
        );

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session =
          event.data.object;

        await createOrderFromStripeSession(
          session
        );

        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    res.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "STRIPE WEBHOOK PROCESSING ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Webhook processing failed",
    });
  }
}


/* =========================================================
   RAZORPAY
========================================================= */

const razorpay =
  new Razorpay({
    key_id:
      process.env.RAZORPAY_KEY_ID,

    key_secret:
      process.env.RAZORPAY_KEY_SECRET,
  });


/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

export async function createRazorpayOrder(
  req,
  res
) {
  try {
    /*
    ---------------------------------------------------------
    Validate cart without creating an order
    ---------------------------------------------------------
    */

    const {
      total,
    } = await validateCart(
      req.user._id
    );

    /*
    ---------------------------------------------------------
    Create Razorpay payment order
    ---------------------------------------------------------
    */

    const razorpayOrder =
      await razorpay.orders.create({
        amount:
          Math.round(total * 100),

        currency: "INR",

        receipt:
          `receipt_${Date.now()}`,
      });

    res.json({
      razorpayOrderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      keyId:
        process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "RAZORPAY ORDER CREATION ERROR:",
      error
    );

    res.status(400).json({
      message:
        error.message ||
        "Unable to create Razorpay order",
    });
  }
}


/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

export async function verifyRazorpayPayment(
  req,
  res
) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
    } = req.body;

    /*
    ---------------------------------------------------------
    1. BASIC PAYMENT VALIDATION
    ---------------------------------------------------------
    */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Missing Razorpay payment details",
      });
    }

    /*
    ---------------------------------------------------------
    2. SHIPPING ADDRESS VALIDATION
    ---------------------------------------------------------
    */

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        message:
          "Complete shipping address is required",
      });
    }

    /*
    ---------------------------------------------------------
    3. VERIFY RAZORPAY SIGNATURE
    ---------------------------------------------------------
    */

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        message:
          "Invalid payment signature",
      });
    }

    /*
    ---------------------------------------------------------
    4. PREVENT DUPLICATE PAYMENT
    ---------------------------------------------------------
    */

    const existingOrder =
      await Order.findOne({
        razorpayPaymentId:
          razorpay_payment_id,
      });

    if (existingOrder) {
      return res.json({
        message:
          "Payment already verified",

        order:
          existingOrder,
      });
    }

    /*
    ---------------------------------------------------------
    5. FETCH ACTUAL RAZORPAY ORDER
    ---------------------------------------------------------
    */

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    if (!razorpayOrder) {
      return res.status(400).json({
        message:
          "Razorpay order not found",
      });
    }

    /*
    ---------------------------------------------------------
    6. VALIDATE CART + CURRENT TOTAL
    ---------------------------------------------------------
    */

    const {
      total,
    } = await validateCart(
      req.user._id
    );

    const expectedAmount =
      Math.round(total * 100);

    if (
      Number(razorpayOrder.amount) !==
      expectedAmount
    ) {
      return res.status(400).json({
        message:
          "Payment amount does not match the cart total.",
      });
    }

    if (
      razorpayOrder.currency !==
      "INR"
    ) {
      return res.status(400).json({
        message:
          "Invalid payment currency.",
      });
    }

    /*
    ---------------------------------------------------------
    7. CREATE PAID ORDER
    ---------------------------------------------------------
    */

    const order =
      await createOrderFromCart({
        customerId:
          req.user._id,

        shippingAddress,

        paymentStatus:
          "PAID",

        razorpayOrderId:
          razorpay_order_id,

        razorpayPaymentId:
          razorpay_payment_id,
      });

    /*
    ---------------------------------------------------------
    8. SUCCESS RESPONSE
    ---------------------------------------------------------
    */

    res.json({
      message:
        "Payment verified and order created successfully",

      order,
    });
  } catch (error) {
    console.error(
      "RAZORPAY PAYMENT VERIFICATION ERROR:",
      error
    );

    res.status(400).json({
      message:
        error.message ||
        "Payment verification failed",
    });
  }
}
