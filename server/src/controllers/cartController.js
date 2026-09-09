import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

async function getOrCreateCart(customerId) {
  let cart = await Cart.findOne({ customerId });

  if (!cart) {
    cart = await Cart.create({
      customerId,
      items: [],
    });
  }

  return cart;
}

/* =========================================================
   HELPERS
========================================================= */

function getVariant(product, variantId) {
  if (!variantId) return null;

  return (
    product.variants?.find(
      (variant) =>
        variant._id.toString() === variantId.toString()
    ) || null
  );
}

function getItemStock(product, variantId) {
  if (variantId) {
    const variant = getVariant(product, variantId);

    return variant
      ? Number(variant.stock || 0)
      : 0;
  }

  return Number(product.stock || 0);
}

/* =========================================================
   GET CART
========================================================= */

export async function getCart(req, res) {
  try {
    const cart = await getOrCreateCart(req.user._id);

    await cart.populate(
      "items.productId",
      "name price images stock storeId variants"
    );

    res.json({ cart });
  } catch (error) {
    console.error("GET CART ERROR:", error);

    res.status(500).json({
      message: "Unable to load cart.",
    });
  }
}

/* =========================================================
   ADD TO CART
========================================================= */

export async function addToCart(req, res) {
  try {
    const {
      productId,
      variantId = null,
      quantity = 1,
    } = req.body;

    const parsedQuantity = Number(quantity);

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required.",
      });
    }

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.active) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    /* =====================================================
       VARIANT PRODUCT
    ===================================================== */

    if (product.variants?.length > 0) {
      if (!variantId) {
        return res.status(400).json({
          message:
            "Please select a product variant.",
        });
      }

      const variant = getVariant(
        product,
        variantId
      );

      if (!variant) {
        return res.status(404).json({
          message: "Selected variant not found.",
        });
      }

      const variantStock = Number(
        variant.stock || 0
      );

      if (variantStock < parsedQuantity) {
        return res.status(400).json({
          message: `Only ${variantStock} item${
            variantStock === 1 ? "" : "s"
          } available in stock for this variant.`,
        });
      }
    }

    /* =====================================================
       NORMAL PRODUCT
    ===================================================== */

    if (!product.variants?.length) {
      if (variantId) {
        return res.status(400).json({
          message:
            "This product does not have variants.",
        });
      }

      if (product.stock < parsedQuantity) {
        return res.status(400).json({
          message: `Only ${product.stock} item${
            product.stock === 1 ? "" : "s"
          } available in stock.`,
        });
      }
    }

    const cart = await getOrCreateCart(
      req.user._id
    );

    /* =====================================================
       FIND SAME PRODUCT + SAME VARIANT
    ===================================================== */

    const item = cart.items.find((cartItem) => {
      const sameProduct =
        cartItem.productId.toString() ===
        productId.toString();

      const existingVariant =
        cartItem.variantId
          ? cartItem.variantId.toString()
          : null;

      const incomingVariant =
        variantId
          ? variantId.toString()
          : null;

      return (
        sameProduct &&
        existingVariant === incomingVariant
      );
    });

    if (item) {
      const stock = getItemStock(
        product,
        variantId
      );

      if (
        item.quantity + parsedQuantity >
        stock
      ) {
        return res.status(400).json({
          message: `Only ${stock} item${
            stock === 1 ? "" : "s"
          } available in stock.`,
        });
      }

      item.quantity += parsedQuantity;
    } else {
      cart.items.push({
        productId,
        variantId: variantId || null,
        quantity: parsedQuantity,
      });
    }

    await cart.save();

    await cart.populate(
      "items.productId",
      "name price images stock storeId variants"
    );

    res.json({ cart });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    res.status(500).json({
      message: "Unable to add product to cart.",
    });
  }
}

/* =========================================================
   UPDATE CART ITEM
========================================================= */

export async function updateCartItem(req, res) {
  try {
    const quantity = Number(req.body.quantity);
    const { variantId = null } = req.body;
    const { productId } = req.params;

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(
      productId
    );

    if (!product || !product.active) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    /* =====================================================
       VALIDATE VARIANT
    ===================================================== */

    if (product.variants?.length > 0) {
      if (!variantId) {
        return res.status(400).json({
          message:
            "Variant ID is required for this product.",
        });
      }

      const variant = getVariant(
        product,
        variantId
      );

      if (!variant) {
        return res.status(404).json({
          message: "Selected variant not found.",
        });
      }
    }

    const stock = getItemStock(
      product,
      variantId
    );

    if (quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} item${
          stock === 1 ? "" : "s"
        } available in stock.`,
      });
    }

    const cart = await getOrCreateCart(
      req.user._id
    );

    const item = cart.items.find((cartItem) => {
      const sameProduct =
        cartItem.productId.toString() ===
        productId.toString();

      const existingVariant =
        cartItem.variantId
          ? cartItem.variantId.toString()
          : null;

      const incomingVariant =
        variantId
          ? variantId.toString()
          : null;

      return (
        sameProduct &&
        existingVariant === incomingVariant
      );
    });

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found.",
      });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate(
      "items.productId",
      "name price images stock storeId variants"
    );

    res.json({ cart });
  } catch (error) {
    console.error(
      "UPDATE CART ITEM ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to update cart item.",
    });
  }
}

/* =========================================================
   REMOVE CART ITEM
========================================================= */

export async function removeCartItem(req, res) {
  try {
    const { productId } = req.params;
    const { variantId = null } = req.body;

    const cart = await getOrCreateCart(
      req.user._id
    );

    cart.items = cart.items.filter((cartItem) => {
      const sameProduct =
        cartItem.productId.toString() ===
        productId.toString();

      const existingVariant =
        cartItem.variantId
          ? cartItem.variantId.toString()
          : null;

      const incomingVariant =
        variantId
          ? variantId.toString()
          : null;

      return !(
        sameProduct &&
        existingVariant === incomingVariant
      );
    });

    await cart.save();

    await cart.populate(
      "items.productId",
      "name price images stock storeId variants"
    );

    res.json({ cart });
  } catch (error) {
    console.error(
      "REMOVE CART ITEM ERROR:",
      error
    );

    res.status(500).json({
      message: "Unable to remove cart item.",
    });
  }
}