import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import {
  sendOrderEmail,
  sendVendorOrderEmail,
} from "../utils/email.js";

/*
=========================================================
VARIANT HELPERS
=========================================================
*/

function getVariant(product, variantId) {
  if (!variantId) {
    return null;
  }

  return (
    product.variants?.find(
      (variant) =>
        variant._id.toString() ===
        variantId.toString()
    ) || null
  );
}

function getVariantOptions(variant) {
  if (!variant?.options) {
    return undefined;
  }

  if (variant.options instanceof Map) {
    return Object.fromEntries(
      variant.options.entries()
    );
  }

  return {
    ...variant.options,
  };
}

function getItemPrice(product, variant) {
  if (variant) {
    return Number(variant.price);
  }

  return Number(product.price);
}

function getItemStock(product, variant) {
  if (variant) {
    return Number(variant.stock || 0);
  }

  return Number(product.stock || 0);
}

function buildOrderItem(
  product,
  quantity,
  variant = null
) {
  const price =
    getItemPrice(
      product,
      variant
    );

  return {
    productId:
      product._id,

    variantId:
      variant?._id || null,

    ...(variant
      ? {
          variantOptions:
            getVariantOptions(
              variant
            ),
        }
      : {}),

    name:
      product.name,

    quantity,

    price,
  };
}


/*
=========================================================
VALIDATE CART
=========================================================
*/

/*
The cart may now contain products from MULTIPLE stores.

Validation still happens product-by-product.

The returned data contains:
- every validated item
- total cart amount
- store groups
*/

export async function validateCart(
  customerId
) {
  const cart =
    await Cart.findOne({
      customerId,
    }).populate(
      "items.productId"
    );

  if (
    !cart ||
    !cart.items.length
  ) {
    throw new Error(
      "Cart is empty"
    );
  }

  let total = 0;

  const items = [];

  /*
  Map of:

  storeId -> {
    store,
    vendor,
    items,
    total
  }
  */

  const storeGroups =
    new Map();

  /*
  -------------------------------------------------------
  VALIDATE EACH CART ITEM
  -------------------------------------------------------
  */

  for (const item of cart.items) {
    if (!item.productId) {
      throw new Error(
        "One or more products are no longer available"
      );
    }

    const product =
      await Product.findById(
        item.productId._id
      );

    if (
      !product ||
      !product.active
    ) {
      throw new Error(
        "One or more products are no longer available"
      );
    }

    /*
    -----------------------------------------------------
    STORE VALIDATION
    -----------------------------------------------------
    */

    const store =
      await Store.findOne({
        _id: product.storeId,
        status: "ACTIVE",
      });

    if (!store) {
      throw new Error(
        `Store for ${product.name} is no longer available`
      );
    }

    /*
    -----------------------------------------------------
    VENDOR VALIDATION
    -----------------------------------------------------
    */

    const vendor =
      await User.findOne({
        _id: store.vendorId,
        role: "VENDOR",
        status: "ACTIVE",
      });

    if (!vendor) {
      throw new Error(
        `Store for ${product.name} is no longer available because its vendor is inactive or deleted.`
      );
    }

    /*
    Product vendor must match store vendor.
    */

    if (
      product.vendorId.toString() !==
      vendor._id.toString()
    ) {
      throw new Error(
        `Product vendor is invalid for ${product.name}`
      );
    }

    /*
    -----------------------------------------------------
    VARIANT VALIDATION
    -----------------------------------------------------
    */

    let variant = null;

    if (
      product.variants?.length > 0
    ) {
      if (!item.variantId) {
        throw new Error(
          `Please select a variant for ${product.name}`
        );
      }

      variant =
        getVariant(
          product,
          item.variantId
        );

      if (!variant) {
        throw new Error(
          `Selected variant is no longer available for ${product.name}`
        );
      }
    } else {
      if (item.variantId) {
        throw new Error(
          `Invalid variant selected for ${product.name}`
        );
      }
    }

    /*
    -----------------------------------------------------
    STOCK VALIDATION
    -----------------------------------------------------
    */

    const availableStock =
      getItemStock(
        product,
        variant
      );

    if (
      availableStock <
      item.quantity
    ) {
      throw new Error(
        `Insufficient stock for ${product.name}${
          variant
            ? " for the selected variant"
            : ""
        }`
      );
    }

    /*
    -----------------------------------------------------
    SERVER-SIDE PRICE
    -----------------------------------------------------
    */

    const price =
      getItemPrice(
        product,
        variant
      );

    const orderItem =
      buildOrderItem(
        product,
        item.quantity,
        variant
      );

    total +=
      price * item.quantity;

    items.push(
      orderItem
    );

    /*
    -----------------------------------------------------
    GROUP ITEM BY STORE
    -----------------------------------------------------
    */

    const storeKey =
      store._id.toString();

    if (
      !storeGroups.has(
        storeKey
      )
    ) {
      storeGroups.set(
        storeKey,
        {
          store,
          vendor,
          items: [],
          total: 0,
        }
      );
    }

    const group =
      storeGroups.get(
        storeKey
      );

    group.items.push(
      orderItem
    );

    group.total +=
      price * item.quantity;
  }

  return {
    cart,

    /*
    These are kept for compatibility
    with existing code that may use
    the first store/vendor.
    */

    store:
      storeGroups.values().next()
        .value?.store || null,

    vendor:
      storeGroups.values().next()
        .value?.vendor || null,

    items,

    total,

    /*
    New multi-store data.
    */

    storeGroups:
      Array.from(
        storeGroups.values()
      ),
  };
}


/*
=========================================================
VALIDATE BUY NOW ITEM
=========================================================
*/

export async function validateBuyNowItem(
  customerId,
  productId,
  quantity,
  variantId = null
) {
  if (!productId) {
    throw new Error(
      "Product is required"
    );
  }

  const parsedQuantity =
    Number(quantity);

  if (
    !Number.isInteger(
      parsedQuantity
    ) ||
    parsedQuantity < 1
  ) {
    throw new Error(
      "Invalid quantity"
    );
  }

  const product =
    await Product.findById(
      productId
    );

  if (
    !product ||
    !product.active
  ) {
    throw new Error(
      "This product is no longer available"
    );
  }

  /*
  -------------------------------------------------------
  VARIANT VALIDATION
  -------------------------------------------------------
  */

  let variant = null;

  if (
    product.variants?.length > 0
  ) {
    if (!variantId) {
      throw new Error(
        "Please select a product variant"
      );
    }

    variant =
      getVariant(
        product,
        variantId
      );

    if (!variant) {
      throw new Error(
        "Selected variant not found"
      );
    }
  } else {
    if (variantId) {
      throw new Error(
        "This product does not have variants"
      );
    }
  }

  /*
  -------------------------------------------------------
  STOCK VALIDATION
  -------------------------------------------------------
  */

  const availableStock =
    getItemStock(
      product,
      variant
    );

  if (
    availableStock <
    parsedQuantity
  ) {
    throw new Error(
      `Insufficient stock for ${product.name}${
        variant
          ? " for the selected variant"
          : ""
      }`
    );
  }

  /*
  -------------------------------------------------------
  STORE VALIDATION
  -------------------------------------------------------
  */

  const store =
    await Store.findOne({
      _id: product.storeId,
      status: "ACTIVE",
    });

  if (!store) {
    throw new Error(
      "This store is no longer available"
    );
  }

  /*
  -------------------------------------------------------
  VENDOR VALIDATION
  -------------------------------------------------------
  */

  const vendor =
    await User.findOne({
      _id: store.vendorId,
      role: "VENDOR",
      status: "ACTIVE",
    });

  if (!vendor) {
    throw new Error(
      "This store is no longer available because its vendor is inactive or deleted."
    );
  }

  if (
    product.vendorId.toString() !==
    vendor._id.toString()
  ) {
    throw new Error(
      "Product vendor is invalid"
    );
  }

  /*
  -------------------------------------------------------
  SERVER-SIDE PRICE + ORDER ITEM
  -------------------------------------------------------
  */

  const item =
    buildOrderItem(
      product,
      parsedQuantity,
      variant
    );

  const total =
    item.price *
    parsedQuantity;

  return {
    product,
    variant,
    store,
    vendor,
    items: [item],
    total,
  };
}


/*
=========================================================
ATOMIC STOCK DECREMENT
=========================================================
*/

export async function reserveStock(
  items
) {
  const updatedStock = [];

  try {
    for (const item of items) {
      /*
      -----------------------------------------------------
      VARIANT STOCK
      -----------------------------------------------------
      */

      if (item.variantId) {
        const updatedProduct =
          await Product.findOneAndUpdate(
            {
              _id:
                item.productId,

              active:
                true,

              variants: {
                $elemMatch: {
                  _id:
                    item.variantId,

                  stock: {
                    $gte:
                      item.quantity,
                  },
                },
              },
            },
            {
              $inc: {
                "variants.$.stock":
                  -item.quantity,
              },
            },
            {
              new: true,
            }
          );

        if (!updatedProduct) {
          throw new Error(
            `Insufficient stock for ${item.name} for the selected variant`
          );
        }

        updatedStock.push({
          productId:
            item.productId,

          variantId:
            item.variantId,

          quantity:
            item.quantity,
        });

        continue;
      }

      /*
      -----------------------------------------------------
      NORMAL PRODUCT STOCK
      -----------------------------------------------------
      */

      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id:
              item.productId,

            active:
              true,

            stock: {
              $gte:
                item.quantity,
            },
          },
          {
            $inc: {
              stock:
                -item.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for ${item.name}`
        );
      }

      updatedStock.push({
        productId:
          item.productId,

        variantId:
          null,

        quantity:
          item.quantity,
      });
    }

    return updatedStock;
  } catch (error) {
    /*
    -----------------------------------------------------
    ROLLBACK
    -----------------------------------------------------
    */

    await restoreStock(
      updatedStock
    );

    throw error;
  }
}


/*
=========================================================
RESTORE STOCK
=========================================================
*/

async function restoreStock(
  items
) {
  for (const item of items) {
    if (item.variantId) {
      await Product.findOneAndUpdate(
        {
          _id:
            item.productId,

          "variants._id":
            item.variantId,
        },
        {
          $inc: {
            "variants.$.stock":
              item.quantity,
          },
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock:
              item.quantity,
          },
        }
      );
    }
  }
}


/*
=========================================================
CREATE ORDERS FROM CART
=========================================================
*/

/*
One payment can now produce multiple orders.

Example:

Store A → Order A
Store B → Order B
Store C → Order C

All orders share the same Razorpay
payment/order identifiers.
*/

export async function createOrdersFromCart({
  customerId,
  shippingAddress,
  paymentStatus = "PENDING",
  razorpayOrderId,
  razorpayPaymentId,
  stripeSessionId,
}) {
  const {
    cart,
    storeGroups,
  } =
    await validateCart(
      customerId
    );

  const allItems =
    storeGroups.flatMap(
      (group) =>
        group.items
    );

  /*
  -------------------------------------------------------
  RESERVE ALL STOCK FIRST
  -------------------------------------------------------
  */

  await reserveStock(
    allItems
  );

  const createdOrders = [];

  try {
    /*
    -----------------------------------------------------
    CREATE ONE ORDER PER STORE
    -----------------------------------------------------
    */

    for (const group of storeGroups) {
      const order =
        await Order.create({
          customerId,

          storeId:
            group.store._id,

          vendorId:
            group.vendor._id,

          items:
            group.items,

          total:
            group.total,

          shippingAddress,

          paymentStatus,

          status:
            "PLACED",

          razorpayOrderId,

          razorpayPaymentId,

          stripeSessionId,
        });

      createdOrders.push(
        order
      );
    }

    /*
    -----------------------------------------------------
    CLEAR CART ONLY AFTER ALL ORDERS ARE CREATED
    -----------------------------------------------------
    */

    cart.items = [];

    await cart.save();

    /*
    -----------------------------------------------------
    SEND EMAILS
    -----------------------------------------------------
    */

    const customer =
      await User.findById(
        customerId
      );

    for (
      const order of createdOrders
    ) {
      const group =
        storeGroups.find(
          (entry) =>
            entry.store._id
              .toString() ===
            order.storeId.toString()
        );

      Promise.allSettled([
        sendOrderEmail({
          to:
            customer?.email,

          orderId:
            order._id.toString(),

          total:
            order.total,

          items:
            order.items,

          shippingAddress,

          customerName:
            customer?.name ||
            "",
        }),

        sendVendorOrderEmail({
          vendorEmail:
            group?.vendor?.email,

          vendorName:
            group?.vendor?.name ||
            "",

          orderId:
            order._id.toString(),

          total:
            order.total,

          items:
            order.items,

          shippingAddress,
        }),
      ]).catch((err) =>
        console.error(
          "ORDER EMAIL ERROR:",
          err
        )
      );
    }

    return {
      orders:
        createdOrders,

      total:
        createdOrders.reduce(
          (sum, order) =>
            sum + order.total,
          0
        ),
    };
  } catch (error) {
    /*
    -----------------------------------------------------
    IF ORDER CREATION FAILS
    -----------------------------------------------------
    */

    /*
    Remove any orders that were already
    created during this attempt.
    */

    if (
      createdOrders.length
    ) {
      await Order.deleteMany({
        _id: {
          $in:
            createdOrders.map(
              (order) =>
                order._id
            ),
        },
      });
    }

    await restoreStock(
      allItems
    );

    throw error;
  }
}


/*
=========================================================
BACKWARD-COMPATIBLE CREATE ORDER FROM CART
=========================================================
*/

/*
Existing code such as older Stripe logic may
still import createOrderFromCart.

It now returns the first order when the cart
contains multiple stores.

New multi-store payment code should use
createOrdersFromCart().
*/

export async function createOrderFromCart(
  options
) {
  const result =
    await createOrdersFromCart(
      options
    );

  return (
    result.orders[0] ||
    null
  );
}


/*
=========================================================
CREATE BUY NOW ORDER
=========================================================
*/

export async function createOrderFromBuyNow({
  customerId,
  productId,
  quantity,
  variantId = null,
  shippingAddress,
  paymentStatus = "PENDING",
  razorpayOrderId,
  razorpayPaymentId,
}) {
  const {
    store,
    vendor,
    items,
    total,
  } =
    await validateBuyNowItem(
      customerId,
      productId,
      quantity,
      variantId
    );

  /*
  -------------------------------------------------------
  RESERVE STOCK
  -------------------------------------------------------
  */

  await reserveStock(
    items
  );

  try {
    const order =
      await Order.create({
        customerId,

        storeId:
          store._id,

        vendorId:
          vendor._id,

        items,

        total,

        shippingAddress,

        paymentStatus,

        status:
          "PLACED",

        razorpayOrderId,

        razorpayPaymentId,
      });

    /*
    -----------------------------------------------------
    SEND EMAILS
    -----------------------------------------------------
    */

    const customer =
      await User.findById(
        customerId
      );

    Promise.allSettled([
      sendOrderEmail({
        to:
          customer?.email,

        orderId:
          order._id.toString(),

        total,

        items,

        shippingAddress,

        customerName:
          customer?.name ||
          "",
      }),

      sendVendorOrderEmail({
        vendorEmail:
          vendor.email,

        vendorName:
          vendor.name ||
          "",

        orderId:
          order._id.toString(),

        total,

        items,

        shippingAddress,
      }),
    ]).catch((err) =>
      console.error(
        "ORDER EMAIL ERROR:",
        err
      )
    );

    return order;
  } catch (error) {
    /*
    -----------------------------------------------------
    ORDER CREATION FAILED
    -----------------------------------------------------
    */

    await restoreStock(
      items
    );

    throw error;
  }
}