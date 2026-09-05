import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createOrderFromCart } from "../services/orderService.js";

export async function createOrder(req, res) {
  try {
    const { shippingAddress } = req.body;

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
        message: "Complete shipping address is required",
      });
    }

    const order = await createOrderFromCart({
      customerId: req.user._id,
      shippingAddress,
      paymentStatus: "PENDING",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    res.status(400).json({
      message:
        error.message ||
        "Failed to create order",
    });
  }
}

export async function myOrders(req, res) {
  try {
    const orders = await Order.find({
      customerId: req.user._id,
    })
      .populate("storeId", "name")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error("MY ORDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
}

export async function vendorOrders(req, res) {
  try {
    const orders = await Order.find({
      vendorId: req.user._id,
    })
      .populate("storeId", "name")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error("VENDOR ORDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch vendor orders",
    });
  }
}

export async function updateOrderStatus(req, res) {
  try {
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
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update order status",
    });
  }
}

export async function cancelOrder(req, res) {
  try {
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
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);

    res.status(500).json({
      message: "Failed to cancel order",
    });
  }
}