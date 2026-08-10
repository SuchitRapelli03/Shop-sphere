import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";

export async function vendorAnalytics(req, res) {
  const [orders, products, stores] = await Promise.all([
    Order.find({ vendorId: req.user._id }),
    Product.countDocuments({ vendorId: req.user._id }),
    Store.countDocuments({ vendorId: req.user._id })
  ]);

  const revenue = orders
    .filter((o) => o.paymentStatus === "PAID" || o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  res.json({ orders: orders.length, products, stores, revenue });
}

export async function adminAnalytics(req, res) {
  const [users, vendors, stores, products, orders] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "VENDOR" }),
    Store.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments()
  ]);

  const revenue = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);

  res.json({
    users,
    vendors,
    stores,
    products,
    orders,
    revenue: revenue[0]?.total || 0
  });
}
