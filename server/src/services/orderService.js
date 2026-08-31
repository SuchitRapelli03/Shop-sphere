import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import { sendOrderEmail } from "../utils/email.js";

/*
=========================================================
VALIDATE CART
=========================================================
*/

export async function validateCart(customerId) {
  const cart = await Cart.findOne({
    customerId,
  }).populate("items.productId");

  if (!cart || !cart.items.length) {
    throw new Error("Cart is empty");
  }

  const firstProduct = cart.items[0].productId;

  if (!firstProduct) {
    throw new Error(
      "One or more products are no longer available"
    );
  }

  const firstStoreId = firstProduct.storeId;

  const store = await Store.findOne({
    _id: firstStoreId,
    status: "ACTIVE",
  });

  if (!store) {
    throw new Error(
      "This store is no longer available"
    );
  }

  const vendor = await User.findOne({
    _id: store.vendorId,
    role: "VENDOR",
    status: "ACTIVE",
  });

  if (!vendor) {
    throw new Error(
      "This store is no longer available because its vendor is inactive or deleted."
    );
  }

  const mixedStore = cart.items.some((item) => {
    if (!item.productId) {
      return true;
    }

    return (
      item.productId.storeId.toString() !==
      firstStoreId.toString()
    );
  });

  if (mixedStore) {
    throw new Error(
      "This MVP supports one store per order. Split your cart by store."
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
        "One or more products are no longer available"
      );
    }

    if (
      product.storeId.toString() !==
      store._id.toString()
    ) {
      throw new Error(
        "Product does not belong to this store"
      );
    }

    if (
      product.vendorId.toString() !==
      vendor._id.toString()
    ) {
      throw new Error(
        "Product vendor is invalid"
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
      price: product.price,
    });
  }

  return {
    cart,
    store,
    vendor,
    items,
    total,
  };
}


/*
=========================================================
ATOMIC STOCK DECREMENT
=========================================================
*/

export async function reserveStock(items) {
  const updatedProducts = [];

  try {
    for (const item of items) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: item.productId,
            active: true,
            stock: {
              $gte: item.quantity,
            },
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for ${item.name}`
        );
      }

      updatedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    return updatedProducts;
  } catch (error) {
    /*
    Roll back anything already reserved if a later
    product fails.
    */

    for (const item of updatedProducts) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    throw error;
  }
}


/*
=========================================================
CREATE ORDER
=========================================================
*/

export async function createOrderFromCart({
  customerId,
  shippingAddress,
  paymentStatus = "PENDING",
  razorpayOrderId,
  razorpayPaymentId,
  stripeSessionId,
}) {
  const {
    cart,
    store,
    vendor,
    items,
    total,
  } = await validateCart(customerId);

  /*
  Reserve stock atomically.
  */

  await reserveStock(items);

  try {
    const order = await Order.create({
      customerId,

      storeId: store._id,

      vendorId: vendor._id,

      items,

      total,

      shippingAddress,

      paymentStatus,

      status: "PLACED",

      razorpayOrderId,

      razorpayPaymentId,

      stripeSessionId,
    });

    /*
    Clear cart only after order creation succeeds.
    */

    cart.items = [];

    await cart.save();

    /*
    Send confirmation email.
    */

    await sendOrderEmail({
      to: (
        await User.findById(customerId)
      )?.email,

      orderId: order._id.toString(),

      total,
    });

    return order;

  } catch (error) {
    /*
    Order creation failed, so restore stock.
    */

    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    throw error;
  }
}