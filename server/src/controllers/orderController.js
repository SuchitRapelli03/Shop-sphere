import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import { sendOrderEmail } from "../utils/email.js";

export async function createOrder(req, res) {
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
        paymentStatus:
          "PENDING",
        status:
          "PLACED",
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

    res.status(201).json({
      message:
        "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create order",
    });
  }
}

export async function myOrders(req, res) {
  const orders = await Order.find({
    customerId: req.user._id,
  }).sort({
    createdAt: -1,
  });

  res.json({ orders });
}

export async function vendorOrders(req, res) {
  const orders = await Order.find({
    vendorId: req.user._id,
  }).sort({
    createdAt: -1,
  });

  res.json({ orders });
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    vendorId: req.user._id,
  });

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const newStatus = req.body.status;

  const allowedStatuses = [
    "PLACED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({
      message: "Invalid order status",
    });
  }

  if (
    newStatus === "CANCELLED" &&
    order.status !== "CANCELLED"
  ) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }
  }

  order.status = newStatus;

  await order.save();

  res.json({ order });
}

export async function cancelOrder(req, res) {
  const order = await Order.findOne({
    _id: req.params.id,
    customerId: req.user._id,
  });

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.status === "CANCELLED") {
    return res.status(400).json({
      message: "Order is already cancelled",
    });
  }

  if (
    !["PLACED", "PROCESSING"].includes(
      order.status
    )
  ) {
    return res.status(400).json({
      message:
        "This order can no longer be cancelled",
    });
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: {
          stock: item.quantity,
        },
      }
    );
  }

  order.status = "CANCELLED";

  await order.save();

  res.json({
    message:
      "Order cancelled successfully",
    order,
  });
}