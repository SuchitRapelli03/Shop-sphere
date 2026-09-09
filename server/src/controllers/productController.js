import Product from "../models/Product.js";
import Store from "../models/Store.js";
import User from "../models/User.js";

/* =========================
VARIANT HELPERS
========================= */

function validateVariants(variants) {
if (variants === undefined) {
return {
valid: true,
variants: undefined,
};
}

if (!Array.isArray(variants)) {
return {
valid: false,
message: "Variants must be an array",
};
}

const normalizedVariants = [];
const variantKeys = new Set();

for (const variant of variants) {
if (!variant || typeof variant !== "object") {
return {
valid: false,
message: "Each variant must be a valid object",
};
}

if (
  !variant.options ||
  typeof variant.options !== "object" ||
  Array.isArray(variant.options)
) {
  return {
    valid: false,
    message: "Each variant must contain valid options",
  };
}

const normalizedOptions = {};

for (const [key, value] of Object.entries(variant.options)) {
  const normalizedKey = String(key).trim().toLowerCase();
  const normalizedValue = String(value ?? "").trim();

  if (!normalizedKey || !normalizedValue) {
    return {
      valid: false,
      message:
        "Variant option names and values cannot be empty",
    };
  }

  normalizedOptions[normalizedKey] = normalizedValue;
}

if (Object.keys(normalizedOptions).length === 0) {
  return {
    valid: false,
    message:
      "Each variant must contain at least one option",
  };
}

const numericPrice = Number(variant.price);

if (
  Number.isNaN(numericPrice) ||
  numericPrice < 0
) {
  return {
    valid: false,
    message:
      "Each variant price must be a valid non-negative number",
  };
}

const numericStock = Number(variant.stock);

if (
  Number.isNaN(numericStock) ||
  numericStock < 0 ||
  !Number.isInteger(numericStock)
) {
  return {
    valid: false,
    message:
      "Each variant stock must be a valid non-negative integer",
  };
}

const duplicateKey = Object.entries(normalizedOptions)
  .sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB)
  )
  .map(([key, value]) => `${key}:${value}`)
  .join("|");

if (variantKeys.has(duplicateKey)) {
  return {
    valid: false,
    message:
      "Duplicate variant option combinations are not allowed",
  };
}

variantKeys.add(duplicateKey);

normalizedVariants.push({
  options: normalizedOptions,
  price: numericPrice,
  stock: numericStock,
});

}

return {
valid: true,
variants: normalizedVariants,
};
}

/* =========================
CREATE PRODUCT
========================= */

export async function createProduct(req, res) {
  try {
    const {
      storeId,
      name,
      description,
      price,
      stock,
      category,
      subcategory,
      images,
      variants,
    } = req.body;

    if (!storeId || !name?.trim()) {
      return res.status(400).json({
        message: "Store and product name are required",
      });
    }

    const variantValidation = validateVariants(variants);

    if (!variantValidation.valid) {
      return res.status(400).json({
        message: variantValidation.message,
      });
    }

    const normalizedVariants =
      variantValidation.variants ?? [];

    const hasVariants = normalizedVariants.length > 0;

    let finalPrice;
    let finalStock;

    /* =========================================
       VARIANT PRODUCT
    ========================================= */

    if (hasVariants) {
      finalPrice = Math.min(
        ...normalizedVariants.map(
          (variant) => variant.price
        )
      );

      finalStock = normalizedVariants.reduce(
        (total, variant) =>
          total + variant.stock,
        0
      );
    }

    /* =========================================
       SIMPLE PRODUCT
    ========================================= */

    else {
      if (price === undefined || price === "") {
        return res.status(400).json({
          message:
            "Price is required for products without variants",
        });
      }

      const numericPrice = Number(price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          message:
            "Price must be a valid non-negative number",
        });
      }

      const numericStock = Number(stock ?? 0);

      if (
        Number.isNaN(numericStock) ||
        numericStock < 0 ||
        !Number.isInteger(numericStock)
      ) {
        return res.status(400).json({
          message:
            "Stock must be a valid non-negative integer",
        });
      }

      finalPrice = numericPrice;
      finalStock = numericStock;
    }

    /* =========================================
       VERIFY STORE OWNERSHIP
    ========================================= */

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

    /* =========================================
       CREATE PRODUCT
    ========================================= */

    const product = await Product.create({
      storeId,
      vendorId: req.user._id,

      name: name.trim(),

      description:
        description?.trim() || "",

      category:
        category?.trim() || "",

      subcategory:
        subcategory?.trim() || "",

      images: Array.isArray(images)
        ? images
        : [],

      price: finalPrice,

      stock: finalStock,

      variants: normalizedVariants,
    });

    res.status(201).json({
      product,
    });
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create product",
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
subcategory,
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

if (subcategory) {
  filter.subcategory = subcategory;
}

if (search?.trim()) {
  const safeSearch = search
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  filter.$or = [
    {
      name: {
        $regex: safeSearch,
        $options: "i",
      },
    },
    {
      description: {
        $regex: safeSearch,
        $options: "i",
      },
    },
  ];
}

if (minPrice !== undefined || maxPrice !== undefined) {
  filter.price = {};

  if (minPrice !== undefined && minPrice !== "") {
    const minimum = Number(minPrice);

    if (!Number.isNaN(minimum) && minimum >= 0) {
      filter.price.$gte = minimum;
    }
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    const maximum = Number(maxPrice);

    if (!Number.isNaN(maximum) && maximum >= 0) {
      filter.price.$lte = maximum;
    }
  }

  if (Object.keys(filter.price).length === 0) {
    delete filter.price;
  }
}

let sortOption = {
  createdAt: -1,
};

if (sort === "price-low") {
  sortOption = {
    price: 1,
  };
}

if (sort === "price-high") {
  sortOption = {
    price: -1,
  };
}

if (sort === "name") {
  sortOption = {
    name: 1,
  };
}

const currentPage = Math.max(
  Number(page) || 1,
  1
);

const itemsPerPage = Math.min(
  Math.max(Number(limit) || 12, 1),
  50
);

const skip =
  (currentPage - 1) * itemsPerPage;

/*
 * Only products whose store is ACTIVE
 * are considered public.
 */
const stores = await Store.find({
  status: "ACTIVE",
}).select("_id vendorId");

const activeStoreIds = stores.map(
  (store) => store._id
);

filter.storeId = storeId
  ? storeId
  : { $in: activeStoreIds };

/*
 * Get products first.
 */
const products = await Product.find(filter)
  .populate(
    "storeId",
    "name slug status vendorId"
  )
  .populate(
    "vendorId",
    "name email status"
  )
  .sort(sortOption);

/*
 * Make sure:
 * - store exists
 * - store is ACTIVE
 * - vendor exists
 * - vendor is ACTIVE
 * - store belongs to that vendor
 */
const validProducts = products.filter(
  (product) =>
    product.storeId &&
    product.storeId.status === "ACTIVE" &&
    product.vendorId &&
    product.vendorId.status === "ACTIVE" &&
    product.storeId.vendorId &&
    product.storeId.vendorId.toString() ===
      product.vendorId._id.toString()
);

const total = validProducts.length;

const paginatedProducts =
  validProducts.slice(
    skip,
    skip + itemsPerPage
  );

res.json({
  products: paginatedProducts,
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

export async function getProduct(
req,
res
) {
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
  !product.storeId.vendorId ||
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

export async function updateProduct(req, res) {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendorId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      subcategory,
      images,
      variants,
      active,
    } = req.body;

    /* =========================================
       BASIC FIELDS
    ========================================= */

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          message:
            "Product name cannot be empty",
        });
      }

      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description =
        String(description).trim();
    }

    if (category !== undefined) {
      product.category =
        String(category).trim();
    }

    if (subcategory !== undefined) {
      product.subcategory =
        String(subcategory).trim();
    }

    if (images !== undefined) {
      product.images = Array.isArray(images)
        ? images
        : [];
    }

    if (active !== undefined) {
      product.active = Boolean(active);
    }

    /* =========================================
       VARIANTS PROVIDED
    ========================================= */

    if (variants !== undefined) {
      const variantValidation =
        validateVariants(variants);

      if (!variantValidation.valid) {
        return res.status(400).json({
          message:
            variantValidation.message,
        });
      }

      const normalizedVariants =
        variantValidation.variants;

      const hasVariants =
        normalizedVariants.length > 0;

      /* =====================================
         PRODUCT WITH VARIANTS
      ===================================== */

      if (hasVariants) {
        product.variants =
          normalizedVariants;

        product.price = Math.min(
          ...normalizedVariants.map(
            (variant) => variant.price
          )
        );

        product.stock =
          normalizedVariants.reduce(
            (total, variant) =>
              total + variant.stock,
            0
          );
      }

      /* =====================================
         SWITCHING TO SIMPLE PRODUCT
      ===================================== */

      else {
        product.variants = [];

        if (
          price === undefined ||
          price === ""
        ) {
          return res.status(400).json({
            message:
              "Price is required when removing all variants",
          });
        }

        const numericPrice =
          Number(price);

        if (
          Number.isNaN(numericPrice) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            message:
              "Price must be a valid non-negative number",
          });
        }

        const numericStock =
          Number(stock ?? product.stock);

        if (
          Number.isNaN(numericStock) ||
          numericStock < 0 ||
          !Number.isInteger(numericStock)
        ) {
          return res.status(400).json({
            message:
              "Stock must be a valid non-negative integer",
          });
        }

        product.price =
          numericPrice;

        product.stock =
          numericStock;
      }
    }

    /* =========================================
       SIMPLE PRODUCT PRICE / STOCK UPDATE
       Only when product has no variants
    ========================================= */

    else if (
      !product.variants ||
      product.variants.length === 0
    ) {
      if (price !== undefined) {
        const numericPrice =
          Number(price);

        if (
          Number.isNaN(numericPrice) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            message:
              "Price must be a valid non-negative number",
          });
        }

        product.price =
          numericPrice;
      }

      if (stock !== undefined) {
        const numericStock =
          Number(stock);

        if (
          Number.isNaN(numericStock) ||
          numericStock < 0 ||
          !Number.isInteger(numericStock)
        ) {
          return res.status(400).json({
            message:
              "Stock must be a valid non-negative integer",
          });
        }

        product.stock =
          numericStock;
      }
    }

    await product.save();

    res.json({
      product,
    });
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
