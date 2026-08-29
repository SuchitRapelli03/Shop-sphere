import Razorpay from "razorpay";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import { sendOrderEmail } from "../utils/email.js";
import stripe from "../utils/stripe.js";

export async function createStripeCheckout(req, res) {
  try {
    const cart = await Cart.findOne({
      customerId: req.user._id
    }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    const lineItems = [];

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

      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            description: product.description || undefined
          },
          unit_amount: Math.round(product.price * 100)
        },
        quantity: item.quantity
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: lineItems,

      customer_email: req.user.email,

      phone_number_collection: {
        enabled: true
      },

      shipping_address_collection: {
        allowed_countries: ["IN"]
      },

      metadata: {
        customerId: req.user._id.toString()
      },

      success_url:
        `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${process.env.CLIENT_URL}/cart`
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error("Stripe checkout creation error:", error);

    res.status(500).json({
      message: "Unable to create Stripe checkout"
    });
  }
}

async function createOrderFromStripeSession(session) {
  const existingOrder = await Order.findOne({
    stripeSessionId: session.id
  });

  if (existingOrder) {
    console.log(
      `Order already exists for Stripe session ${session.id}`
    );

    return existingOrder;
  }

  const customerId = session.metadata?.customerId;

  if (!customerId) {
    throw new Error(
      "Stripe session is missing customerId"
    );
  }

  const cart = await Cart.findOne({
    customerId
  }).populate("items.productId");

  if (!cart || !cart.items.length) {
    throw new Error("Cart is empty during Stripe webhook");
  }

  const firstStoreId =
    cart.items[0].productId.storeId;

  const mixedStore = cart.items.some(
    (item) =>
      item.productId.storeId.toString() !==
      firstStoreId.toString()
  );

  if (mixedStore) {
    throw new Error(
      "This MVP supports one store per order"
    );
  }

  let total = 0;
  const items = [];

  for (const item of cart.items) {
    const product = await Product.findById(
      item.productId._id
    );

    if (!product || !product.active) {
      throw new Error(
        `Product ${item.productId.name} is no longer available`
      );
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}`
      );
    }

    total += product.price * item.quantity;

    items.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price
    });
  }

  const shipping = session.shipping_details;

  const order = await Order.create({
    customerId,
    storeId: firstStoreId,
    vendorId: cart.items[0].productId.vendorId,

    items,
    total,

    shippingAddress: {
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
        "Not provided"
    },

    paymentStatus: "PAID",
    status: "PLACED",

    stripeSessionId: session.id
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(
      item.productId._id,
      {
        $inc: {
          stock: -item.quantity
        }
      }
    );
  }

  cart.items = [];
  await cart.save();

  const customer = await (
    await import("../models/User.js")
  ).default.findById(customerId);

  if (customer?.email) {
    await sendOrderEmail({
      to: customer.email,
      orderId: order._id.toString(),
      total
    });
  }

  console.log(
    `Stripe order created: ${order._id}`
  );

  return order;
}

export async function handleStripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (session.payment_status !== "paid") {
          break;
        }

        await createOrderFromStripeSession(session);

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;

        await createOrderFromStripeSession(session);

        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    res.status(500).json({
      message: "Webhook processing failed"
    });
  }
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   CREATE RAZORPAY ORDER
========================= */

export async function createRazorpayOrder(
  req,
  res
) {
  try {
    const cart = await Cart.findOne({
      customerId: req.user._id,
    }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const firstProduct =
      cart.items[0].productId;

    if (!firstProduct) {
      return res.status(400).json({
        message:
          "One or more products are no longer available",
      });
    }

    const firstStoreId =
      firstProduct.storeId;

    const store =
      await Store.findOne({
        _id: firstStoreId,
        status: "ACTIVE",
      });

    if (!store) {
      return res.status(400).json({
        message:
          "This store is no longer available",
      });
    }

    const vendor =
      await User.findOne({
        _id: store.vendorId,
        role: "VENDOR",
        status: "ACTIVE",
      });

    if (!vendor) {
      return res.status(400).json({
        message:
          "This store is no longer available because its vendor is inactive or deleted.",
      });
    }

    const mixedStore =
      cart.items.some(
        (item) => {
          if (!item.productId) {
            return true;
          }

          return (
            item.productId.storeId.toString() !==
            firstStoreId.toString()
          );
        }
      );

    if (mixedStore) {
      return res.status(400).json({
        message:
          "This MVP supports one store per order. Split your cart by store.",
      });
    }

    let total = 0;

    for (const item of cart.items) {
      const product =
        await Product.findById(
          item.productId._id
        );

      if (
        !product ||
        !product.active
      ) {
        return res.status(400).json({
          message:
            "One or more products are no longer available",
        });
      }

      if (
        product.storeId.toString() !==
        store._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Product does not belong to this store",
        });
      }

      if (
        product.vendorId.toString() !==
        vendor._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Product vendor is invalid",
        });
      }

      if (
        product.stock <
        item.quantity
      ) {
        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}`,
        });
      }

      total +=
        product.price *
        item.quantity;
    }

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

    res.status(500).json({
      message:
        "Unable to create Razorpay order",
    });
  }
}


/* =========================
   VERIFY PAYMENT
========================= */

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

    const cart = await Cart.findOne({
      customerId: req.user._id,
    }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const firstProduct =
      cart.items[0].productId;

    if (!firstProduct) {
      return res.status(400).json({
        message:
          "One or more products are no longer available",
      });
    }

    const firstStoreId =
      firstProduct.storeId;

    const store =
      await Store.findOne({
        _id: firstStoreId,
        status: "ACTIVE",
      });

    if (!store) {
      return res.status(400).json({
        message:
          "This store is no longer available",
      });
    }

    const vendor =
      await User.findOne({
        _id: store.vendorId,
        role: "VENDOR",
        status: "ACTIVE",
      });

    if (!vendor) {
      return res.status(400).json({
        message:
          "This store is no longer available because its vendor is inactive or deleted.",
      });
    }

    const mixedStore =
      cart.items.some(
        (item) => {
          if (!item.productId) {
            return true;
          }

          return (
            item.productId.storeId.toString() !==
            firstStoreId.toString()
          );
        }
      );

    if (mixedStore) {
      return res.status(400).json({
        message:
          "This MVP supports one store per order. Split your cart by store.",
      });
    }

    let total = 0;
    const items = [];

    for (const item of cart.items) {
      const product =
        await Product.findById(
          item.productId._id
        );

      if (
        !product ||
        !product.active
      ) {
        return res.status(400).json({
          message:
            "One or more products are no longer available",
        });
      }

      if (
        product.storeId.toString() !==
        store._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Product does not belong to this store",
        });
      }

      if (
        product.vendorId.toString() !==
        vendor._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Product vendor is invalid",
        });
      }

      if (
        product.stock <
        item.quantity
      ) {
        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}`,
        });
      }

      total +=
        product.price *
        item.quantity;

      items.push({
        productId:
          product._id,
        name:
          product.name,
        quantity:
          item.quantity,
        price:
          product.price,
      });
    }

    const order =
      await Order.create({
        customerId:
          req.user._id,

        storeId:
          store._id,

        vendorId:
          vendor._id,

        items,

        total,

        shippingAddress: {
          fullName:
            shippingAddress.fullName.trim(),
          phone:
            shippingAddress.phone.trim(),
          addressLine:
            shippingAddress.addressLine.trim(),
          city:
            shippingAddress.city.trim(),
          state:
            shippingAddress.state.trim(),
          pincode:
            shippingAddress.pincode.trim(),
        },

        paymentStatus:
          "PAID",

        status:
          "PLACED",

        razorpayOrderId:
          razorpay_order_id,

        razorpayPaymentId:
          razorpay_payment_id,
      });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        {
          $inc: {
            stock:
              -item.quantity,
          },
        }
      );
    }

    cart.items = [];

    await cart.save();

    await sendOrderEmail({
      to: req.user.email,
      orderId:
        order._id.toString(),
      total,
    });

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

    res.status(500).json({
      message:
        "Payment verification failed",
    });
  }
}