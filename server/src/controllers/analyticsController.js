import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";


/* =========================
   VENDOR ANALYTICS
========================= */

export async function vendorAnalytics(req, res) {
  try {
    const vendorId = req.user._id;

    const [
      orders,
      products,
      stores
    ] = await Promise.all([
      Order.find({ vendorId }).sort({ createdAt: -1 }),

      Product.countDocuments({
        vendorId
      }),

      Store.countDocuments({
        vendorId
      })
    ]);


    /* =========================
       ORDER STATISTICS
    ========================= */

    const pendingOrders = orders.filter(
      (order) =>
        ["PLACED", "PROCESSING", "SHIPPED"].includes(
          order.status
        )
    ).length;


    const completedOrders = orders.filter(
      (order) =>
        order.status === "DELIVERED"
    ).length;


    const cancelledOrders = orders.filter(
      (order) =>
        order.status === "CANCELLED"
    ).length;


    /* =========================
       REVENUE
    ========================= */

    const paidOrders = orders.filter(
      (order) =>
        order.paymentStatus === "PAID" &&
        order.status !== "CANCELLED"
    );


    const revenue = paidOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );


    /* =========================
       LAST 7 DAYS
    ========================= */

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setHours(0, 0, 0, 0);

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6
    );


    const dailyAnalytics = await Order.aggregate([
      {
        $match: {
          vendorId,
          createdAt: {
            $gte: sevenDaysAgo
          }
        }
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },

          orders: {
            $sum: 1
          },

          revenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$paymentStatus",
                        "PAID"
                      ]
                    },

                    {
                      $ne: [
                        "$status",
                        "CANCELLED"
                      ]
                    }
                  ]
                },

                "$total",

                0
              ]
            }
          }
        }
      },

      {
        $sort: {
          _id: 1
        }
      }
    ]);


    /* =========================
       FILL ALL 7 DAYS
    ========================= */

    const revenueTrend = [];


    for (let i = 0; i < 7; i++) {

      const date = new Date(
        sevenDaysAgo
      );

      date.setDate(
        sevenDaysAgo.getDate() + i
      );


      const dateString =
        date.toISOString().split("T")[0];


      const existingDay =
        dailyAnalytics.find(
          (day) =>
            day._id === dateString
        );


      revenueTrend.push({
        date: dateString,

        orders:
          existingDay?.orders || 0,

        revenue:
          existingDay?.revenue || 0
      });
    }


    /* =========================
       RESPONSE
    ========================= */

    res.json({
      stores,
      products,
      orders: orders.length,

      revenue,

      pendingOrders,
      completedOrders,
      cancelledOrders,

      revenueTrend
    });

  } catch (error) {

    console.error(
      "VENDOR ANALYTICS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load vendor analytics"
    });
  }
}


/* =========================
   ADMIN ANALYTICS
========================= */

export async function adminAnalytics(req, res) {

  try {

    /* =========================
       BASIC PLATFORM COUNTS
    ========================= */

    const [
      users,
      vendors,
      stores,
      products,
      activeVendors,
      activeStores
    ] = await Promise.all([

      User.countDocuments(),

      User.countDocuments({
        role: "VENDOR"
      }),

      Store.countDocuments(),

      Product.countDocuments(),

      User.countDocuments({
        role: "VENDOR",
        status: "ACTIVE"
      }),

      Store.countDocuments({
        status: "ACTIVE"
      })

    ]);


    /* =================================================
       CURRENT ACTIVE VENDOR ORDERS ONLY

       This prevents orders belonging to:
       - deleted vendors
       - suspended vendors
       - non-vendor users

       from appearing in admin analytics.
    ================================================= */

    const activeVendorOrderMatch = {

      $lookup: {
        from: "users",

        localField: "vendorId",

        foreignField: "_id",

        as: "vendor"
      }

    };


    /* =========================
       TOTAL ORDERS
    ========================= */

    const ordersResult =
      await Order.aggregate([

        activeVendorOrderMatch,

        {
          $match: {
            "vendor.0": {
              $exists: true
            },

            "vendor.role": "VENDOR",

            "vendor.status": "ACTIVE"
          }
        },

        {
          $count: "total"
        }

      ]);


    const orders =
      ordersResult[0]?.total || 0;


    /* =========================
       PENDING ORDERS
    ========================= */

    const pendingOrdersResult =
      await Order.aggregate([

        activeVendorOrderMatch,

        {
          $match: {
            "vendor.0": {
              $exists: true
            },

            "vendor.role": "VENDOR",

            "vendor.status": "ACTIVE",

            status: {
              $in: [
                "PLACED",
                "PROCESSING",
                "SHIPPED"
              ]
            }
          }
        },

        {
          $count: "total"
        }

      ]);


    const pendingOrders =
      pendingOrdersResult[0]?.total || 0;


    /* =========================
       COMPLETED ORDERS
    ========================= */

    const completedOrdersResult =
      await Order.aggregate([

        activeVendorOrderMatch,

        {
          $match: {
            "vendor.0": {
              $exists: true
            },

            "vendor.role": "VENDOR",

            "vendor.status": "ACTIVE",

            status: "DELIVERED"
          }
        },

        {
          $count: "total"
        }

      ]);


    const completedOrders =
      completedOrdersResult[0]?.total || 0;


    /* =========================
       CANCELLED ORDERS
    ========================= */

    const cancelledOrdersResult =
      await Order.aggregate([

        activeVendorOrderMatch,

        {
          $match: {
            "vendor.0": {
              $exists: true
            },

            "vendor.role": "VENDOR",

            "vendor.status": "ACTIVE",

            status: "CANCELLED"
          }
        },

        {
          $count: "total"
        }

      ]);


    const cancelledOrders =
      cancelledOrdersResult[0]?.total || 0;


    /* =========================
       CURRENT PLATFORM REVENUE
       
       ONLY:
       - Existing vendor
       - Vendor role
       - ACTIVE vendor
       - PAID order
       - Non-cancelled order
    ========================= */

    const revenueResult =
      await Order.aggregate([

        activeVendorOrderMatch,

        {
          $match: {

            "vendor.0": {
              $exists: true
            },

            "vendor.role": "VENDOR",

            "vendor.status": "ACTIVE",

            paymentStatus: "PAID",

            status: {
              $ne: "CANCELLED"
            }

          }
        },

        {
          $group: {

            _id: null,

            total: {
              $sum: {
                $toDouble: {
                  $ifNull: [
                    "$total",
                    0
                  ]
                }
              }
            }

          }
        }

      ]);


    const revenue =
      revenueResult[0]?.total || 0;


    /* =========================
       LAST 7 DAYS
    ========================= */

    const sevenDaysAgo =
      new Date();


    sevenDaysAgo.setHours(
      0,
      0,
      0,
      0
    );


    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 6
    );


    /* =========================
       ADMIN DAILY ANALYTICS

       ONLY CURRENT ACTIVE VENDORS
    ========================= */

    const dailyAnalytics =
      await Order.aggregate([

        {
          $match: {
            createdAt: {
              $gte: sevenDaysAgo
            }
          }
        },

        activeVendorOrderMatch,

        {
          $match: {

            "vendor.0": {
              $exists: true
            },

            "vendor.role": "VENDOR",

            "vendor.status": "ACTIVE"

          }
        },

        {
          $group: {

            _id: {

              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt"
              }

            },

            orders: {
              $sum: 1
            },

            revenue: {

              $sum: {

                $cond: [

                  {
                    $and: [

                      {
                        $eq: [
                          "$paymentStatus",
                          "PAID"
                        ]
                      },

                      {
                        $ne: [
                          "$status",
                          "CANCELLED"
                        ]
                      }

                    ]
                  },

                  {
                    $toDouble: {
                      $ifNull: [
                        "$total",
                        0
                      ]
                    }
                  },

                  0

                ]

              }

            }

          }

        },

        {
          $sort: {
            _id: 1
          }
        }

      ]);


    /* =========================
       FILL ALL 7 DAYS
    ========================= */

    const revenueTrend = [];


    for (let i = 0; i < 7; i++) {

      const date =
        new Date(
          sevenDaysAgo
        );


      date.setDate(
        sevenDaysAgo.getDate() + i
      );


      const dateString =
        date
          .toISOString()
          .split("T")[0];


      const existingDay =
        dailyAnalytics.find(
          (day) =>
            day._id === dateString
        );


      revenueTrend.push({

        date: dateString,

        orders:
          existingDay?.orders || 0,

        revenue:
          existingDay?.revenue || 0

      });

    }


    /* =========================
       FINAL RESPONSE
    ========================= */

    res.json({

      users,

      vendors,

      stores,

      products,

      orders,

      revenue,

      pendingOrders,

      completedOrders,

      cancelledOrders,

      activeVendors,

      activeStores,

      revenueTrend

    });

  } catch (error) {

    console.error(
      "ADMIN ANALYTICS ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to load admin analytics"

    });

  }

}