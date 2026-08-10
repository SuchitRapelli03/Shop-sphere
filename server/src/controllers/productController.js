import Product from "../models/Product.js";
import Store from "../models/Store.js";

export async function createProduct(req, res) {
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
  });

  if (!store) {
    return res.status(403).json({
      message: "You do not own this store",
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
}

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

    // Store filter
    if (storeId) {
      filter.storeId = storeId;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Search by product name or description
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

    // Price filtering
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "price-low") {
      sortOption = { price: 1 };
    }

    if (sort === "price-high") {
      sortOption = { price: -1 };
    }

    if (sort === "name") {
      sortOption = { name: 1 };
    }

    // Pagination
    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("storeId", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(itemsPerPage),

      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        pages: Math.ceil(
          total / itemsPerPage
        ),
      },
    });
  } catch (error) {
    console.error("Product search error:", error);

    res.status(500).json({
      message: "Unable to load products",
    });
  }
}

export async function getProduct(req, res) {
  const product = await Product.findById(
    req.params.id
  ).populate("storeId", "name slug");

  if (!product || !product.active) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json({ product });
}

export async function updateProduct(req, res) {
  const product = await Product.findOne({
    _id: req.params.id,
    vendorId: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  Object.assign(product, req.body);

  await product.save();

  res.json({ product });
}

export async function deleteProduct(req, res) {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    vendorId: req.user._id,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json({
    message: "Product deleted",
  });
}