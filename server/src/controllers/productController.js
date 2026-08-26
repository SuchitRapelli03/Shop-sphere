import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";

export async function createProduct(req, res) {
  try {
    const {
      storeId,
      name,
      description,
      price,
      stock,
      category,
      images,
    } = req.body;

    const store = await Store.findOne({
      _id: storeId,
      vendorId: req.user._id,
      status: "ACTIVE",
    });

    if (!store) {
      return res.status(403).json({
        message:
          "You do not own this active store",
      });
    }

    const product = await Product.create({
      storeId,
      vendorId: req.user._id,
      name,
      description,
      price,
      stock,
      category,
      images: images || [],
    });

    res.status(201).json({ product });
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to create product",
    });
  }
}

/* =========================
   PUBLIC PRODUCTS
========================= */

export async function listProducts(req, res) {
  try {
    const {
      search,
      storeId,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      active: true,
    };

    if (storeId) {
      filter.storeId = storeId;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte =
          Number(maxPrice);
      }
    }

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price-low") {
      sortOption = { price: 1 };
    }

    if (sort === "price-high") {
      sortOption = { price: -1 };
    }

    if (sort === "name") {
      sortOption = { name: 1 };
    }

    const currentPage =
      Math.max(Number(page), 1);

    const itemsPerPage =
      Math.min(
        Math.max(Number(limit), 1),
        50
      );

    const skip =
      (currentPage - 1) *
      itemsPerPage;

    const products =
      await Product.find(filter)
        .populate(
          "storeId",
          "name slug status vendorId"
        )
        .populate(
          "vendorId",
          "name email status"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage);

    const validProducts =
      products.filter(
        (product) =>
          product.storeId &&
          product.storeId.status ===
            "ACTIVE" &&
          product.vendorId &&
          product.vendorId.status ===
            "ACTIVE" &&
          product.storeId.vendorId &&
          product.storeId.vendorId.toString() ===
            product.vendorId._id.toString()
      );

    res.json({
      products: validProducts,

      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total: validProducts.length,
        pages: Math.ceil(
          validProducts.length /
            itemsPerPage
        ),
      },
    });
  } catch (error) {
    console.error(
      "PRODUCT SEARCH ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to load products",
    });
  }
}

/* =========================
   VENDOR PRODUCTS
========================= */

export async function listVendorProducts(
  req,
  res
) {
  try {
    const products =
      await Product.find({
        vendorId: req.user._id,
      })
        .populate(
          "storeId",
          "name slug status"
        )
        .sort({
          createdAt: -1,
        });

    res.json({ products });
  } catch (error) {
    console.error(
      "LIST VENDOR PRODUCTS ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load your products",
    });
  }
}

/* =========================
   GET PRODUCT
========================= */

export async function getProduct(req, res) {
  try {
    const product =
      await Product.findById(
        req.params.id
      )
        .populate(
          "storeId",
          "name slug status vendorId"
        )
        .populate(
          "vendorId",
          "name email status"
        );

    if (
      !product ||
      !product.active ||
      !product.storeId ||
      product.storeId.status !==
        "ACTIVE" ||
      !product.vendorId ||
      product.vendorId.status !==
        "ACTIVE" ||
      product.storeId.vendorId.toString() !==
        product.vendorId._id.toString()
    ) {
      return res.status(404).json({
        message:
          "Product is no longer available",
      });
    }

    res.json({ product });
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to load product",
    });
  }
}

/* =========================
   UPDATE PRODUCT
========================= */

export async function updateProduct(
  req,
  res
) {
  try {
    const product =
      await Product.findOne({
        _id: req.params.id,
        vendorId: req.user._id,
      });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    Object.assign(
      product,
      req.body
    );

    await product.save();

    res.json({ product });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update product",
    });
  }
}

/* =========================
   DELETE PRODUCT
========================= */

export async function deleteProduct(
  req,
  res
) {
  try {
    const product =
      await Product.findOneAndDelete({
        _id: req.params.id,
        vendorId: req.user._id,
      });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete product",
    });
  }
}