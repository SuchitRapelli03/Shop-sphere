import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { sendOrderEmail } from "../utils/email.js";

export async function createOrder(req, res) {
  const cart = await Cart.findOne({
    customerId: req.user._id
  }).populate("items.productId");

  if (!cart || !cart.items.length) {
    return res.status(400).json({
      message: "Cart is empty"
    });
  }

  const firstStoreId = cart.items[0].productId.storeId;

  const mixedStore = cart.items.some(
    (item) =>
      item.productId.storeId.toString() !== firstStoreId.toString()
  );

  if (mixedStore) {
    return res.status(400).json({
      message:
        "This MVP supports one store per order. Split your cart by store."
    });
  }

  let total = 0;
  const items = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId._id);

    if (!product || !product.active) {
      return res.status(400).json({
        message: `Product ${item.productId.name} is no longer available`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}`
      });
    }

    total += product.price * item.quantity;

    items.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price
    });
  }

  const order = await Order.create({
    customerId: req.user._id,
    storeId: firstStoreId,
    vendorId: cart.items[0].productId.vendorId,
    items,
    total,
    paymentStatus: "PENDING",
    status: "PLACED"
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

  await sendOrderEmail({
    to: req.user.email,
    orderId: order._id.toString(),
    total
  });

  res.status(201).json({
    message: "Order placed successfully",
    order
  });
}

export async function myOrders(req, res) {
  const orders = await Order.find({
    customerId: req.user._id
  }).sort({
    createdAt: -1
  });

  res.json({
    orders
  });
}

export async function vendorOrders(req, res) {
  const orders = await Order.find({
    vendorId: req.user._id
  }).sort({
    createdAt: -1
  });

  res.json({
    orders
  });
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    vendorId: req.user._id
  });

  if (!order) {
    return res.status(404).json({
      message: "Order not found"
    });
  }

  order.status = req.body.status;

  await order.save();

  res.json({
    order
  });
}