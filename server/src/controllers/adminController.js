// server/src/controllers/adminController.js

import User from "../models/User.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

/* =========================
   USER MANAGEMENT
========================= */

export async function getAllUsers(req, res) {
  try {
    const { search = "", role = "" } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      users
    });
  } catch (error) {
    console.error("GET ADMIN USERS ERROR:", error);

    res.status(500).json({
      message: "Failed to load users"
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.role === "SUPER_ADMIN") {
      return res.status(400).json({
        message: "Super admin cannot be deleted"
      });
    }

    if (user.role === "VENDOR") {
      const [
        storeCount,
        productCount,
        orderCount
      ] = await Promise.all([
        Store.countDocuments({
          vendorId: user._id
        }),
        Product.countDocuments({
          vendorId: user._id
        }),
        Order.countDocuments({
          vendorId: user._id
        })
      ]);

      if (
        storeCount > 0 ||
        productCount > 0 ||
        orderCount > 0
      ) {
        return res.status(400).json({
          message:
            "Vendor cannot be deleted because they have stores, products, or orders."
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("DELETE ADMIN USER ERROR:", error);

    res.status(500).json({
      message: "Failed to delete user"
    });
  }
}

/* =========================
   VENDOR MANAGEMENT
========================= */

export async function getAllVendors(req, res) {
  try {
    const { search = "" } = req.query;

    const filter = {
      role: "VENDOR"
    };

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const vendors = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    const vendorData = await Promise.all(
      vendors.map(async (vendor) => {
        const [
          storeCount,
          productCount,
          orderCount,
          revenueResult
        ] = await Promise.all([
          Store.countDocuments({
            vendorId: vendor._id
          }),

          Product.countDocuments({
            vendorId: vendor._id
          }),

          Order.countDocuments({
            vendorId: vendor._id
          }),

          Order.aggregate([
            {
              $match: {
                vendorId: vendor._id,
                status: {
                  $ne: "CANCELLED"
                }
              }
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$total"
                }
              }
            }
          ])
        ]);

        return {
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          role: vendor.role,
          status: vendor.status || "ACTIVE",
          createdAt: vendor.createdAt,
          stores: storeCount,
          products: productCount,
          orders: orderCount,
          revenue:
            revenueResult[0]?.total || 0
        };
      })
    );

    res.json({
      vendors: vendorData
    });
  } catch (error) {
    console.error("GET ADMIN VENDORS ERROR:", error);

    res.status(500).json({
      message: "Failed to load vendors"
    });
  }
}

export async function updateVendorStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid vendor status"
      });
    }

    const vendor = await User.findOne({
      _id: req.params.id,
      role: "VENDOR"
    });

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    vendor.status = status;

    await vendor.save();

    res.json({
      message:
        status === "SUSPENDED"
          ? "Vendor suspended successfully"
          : "Vendor activated successfully",

      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        status: vendor.status
      }
    });
  } catch (error) {
    console.error(
      "UPDATE ADMIN VENDOR STATUS ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update vendor status"
    });
  }
}

export async function deleteVendor(req, res) {
  try {
    const vendor = await User.findOne({
      _id: req.params.id,
      role: "VENDOR"
    });

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    const [
      storeCount,
      productCount,
      orderCount
    ] = await Promise.all([
      Store.countDocuments({
        vendorId: vendor._id
      }),

      Product.countDocuments({
        vendorId: vendor._id
      }),

      Order.countDocuments({
        vendorId: vendor._id
      })
    ]);

    if (
      storeCount > 0 ||
      productCount > 0 ||
      orderCount > 0
    ) {
      return res.status(400).json({
        message:
          "Vendor cannot be deleted because they have stores, products, or orders."
      });
    }

    await User.findByIdAndDelete(vendor._id);

    res.json({
      message: "Vendor deleted successfully"
    });
  } catch (error) {
    console.error("DELETE ADMIN VENDOR ERROR:", error);

    res.status(500).json({
      message: "Failed to delete vendor"
    });
  }
}

/* =========================
   STORE MANAGEMENT
========================= */

export async function getAllStores(req, res) {
  try {
    const {
      search = "",
      status = ""
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { slug: searchRegex }
      ];
    }

    const stores = await Store.find(filter)
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 });

    const storeData = await Promise.all(
      stores.map(async (store) => {
        const [
          productCount,
          orderCount,
          revenueResult
        ] = await Promise.all([
          Product.countDocuments({
            storeId: store._id
          }),

          Order.countDocuments({
            storeId: store._id
          }),

          Order.aggregate([
            {
              $match: {
                storeId: store._id,
                status: {
                  $ne: "CANCELLED"
                }
              }
            },
            {
              $group: {
                _id: null,
                total: {
                  $sum: "$total"
                }
              }
            }
          ])
        ]);

        return {
          _id: store._id,
          name: store.name,
          slug: store.slug,
          description: store.description,
          status: store.status,
          createdAt: store.createdAt,

          vendor: store.vendorId
            ? {
                _id: store.vendorId._id,
                name: store.vendorId.name,
                email: store.vendorId.email
              }
            : null,

          products: productCount,
          orders: orderCount,
          revenue:
            revenueResult[0]?.total || 0
        };
      })
    );

    res.json({
      stores: storeData
    });
  } catch (error) {
    console.error("GET ADMIN STORES ERROR:", error);

    res.status(500).json({
      message: "Failed to load stores"
    });
  }
}

export async function updateStoreStatus(req, res) {
  try {
    const { status } = req.body;

    if (
      !["ACTIVE", "SUSPENDED"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid store status"
      });
    }

    const store = await Store.findById(
      req.params.id
    );

    if (!store) {
      return res.status(404).json({
        message: "Store not found"
      });
    }

    store.status = status;

    await store.save();

    res.json({
      message:
        `Store ${status.toLowerCase()} successfully`,
      store
    });
  } catch (error) {
    console.error(
      "UPDATE ADMIN STORE STATUS ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update store status"
    });
  }
}

/* =========================
   ORDER MANAGEMENT
========================= */

export async function getAllOrders(req, res) {
  try {
    const { status = "" } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customerId", "name email")
      .populate("vendorId", "name email")
      .populate("storeId", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      orders
    });
  } catch (error) {
    console.error("GET ADMIN ORDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to load orders"
    });
  }
}