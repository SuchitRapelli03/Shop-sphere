import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";

vi.mock("../src/utils/email.js", () => ({
  sendOrderEmail: vi.fn().mockResolvedValue(true),
  sendVendorOrderEmail: vi.fn().mockResolvedValue(true),
}));

import {
  validateCart,
  validateBuyNowItem,
  reserveStock,
  createOrdersFromCart,
} from "../src/services/orderService.js";

import Cart from "../src/models/Cart.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";
import Store from "../src/models/Store.js";
import User from "../src/models/User.js";

/*
=========================================================
REAL OBJECT IDS
=========================================================
*/

const customerId = new mongoose.Types.ObjectId();

const vendorA = new mongoose.Types.ObjectId();
const vendorB = new mongoose.Types.ObjectId();

const storeA = new mongoose.Types.ObjectId();
const storeB = new mongoose.Types.ObjectId();

const productA = new mongoose.Types.ObjectId();
const productB = new mongoose.Types.ObjectId();

const variantA = new mongoose.Types.ObjectId();

/*
=========================================================
HELPERS
=========================================================
*/

function makeVariant({
  id = variantA,
  price = 100,
  stock = 10,
  options = { Size: "M" },
} = {}) {
  return {
    _id: id,
    price,
    stock,
    options,
  };
}

function makeProduct({
  id = productA,
  name = "Test Product",
  price = 100,
  stock = 10,
  vendorId = vendorA,
  storeId = storeA,
  active = true,
  variants = [],
} = {}) {
  return {
    _id: id,
    name,
    price,
    stock,
    vendorId,
    storeId,
    active,
    variants,
  };
}

function makeStore({
  id = storeA,
  vendorId = vendorA,
  status = "ACTIVE",
} = {}) {
  return {
    _id: id,
    vendorId,
    status,
  };
}

function makeVendor({
  id = vendorA,
  name = "Test Vendor",
  email = "vendor@test.com",
  role = "VENDOR",
  status = "ACTIVE",
} = {}) {
  return {
    _id: id,
    name,
    email,
    role,
    status,
  };
}

/*
=========================================================
MULTI-STORE CART SETUP
=========================================================
*/

function setupMultiStoreCart() {
  const productOne = makeProduct({
    id: productA,
    name: "Product A",
    price: 100,
    stock: 10,
    vendorId: vendorA,
    storeId: storeA,
  });

  const productTwo = makeProduct({
    id: productB,
    name: "Product B",
    price: 200,
    stock: 10,
    vendorId: vendorB,
    storeId: storeB,
  });

  const storeOne = makeStore({
    id: storeA,
    vendorId: vendorA,
  });

  const storeTwo = makeStore({
    id: storeB,
    vendorId: vendorB,
  });

  const vendorOne = makeVendor({
    id: vendorA,
    name: "Vendor A",
    email: "vendora@test.com",
  });

  const vendorTwo = makeVendor({
    id: vendorB,
    name: "Vendor B",
    email: "vendorb@test.com",
  });

  const cart = {
    customerId,
    items: [
      {
        productId: productOne,
        quantity: 2,
      },
      {
        productId: productTwo,
        quantity: 3,
      },
    ],
    save: vi.fn().mockResolvedValue(true),
  };

  vi.spyOn(Cart, "findOne").mockReturnValue({
    populate: vi.fn().mockResolvedValue(cart),
  });

  vi.spyOn(Product, "findById").mockImplementation(
    async (id) => {
      if (id.toString() === productA.toString()) {
        return productOne;
      }

      if (id.toString() === productB.toString()) {
        return productTwo;
      }

      return null;
    }
  );

  vi.spyOn(Store, "findOne").mockImplementation(
    async (query) => {
      if (
        query._id.toString() ===
        storeA.toString()
      ) {
        return storeOne;
      }

      if (
        query._id.toString() ===
        storeB.toString()
      ) {
        return storeTwo;
      }

      return null;
    }
  );

  vi.spyOn(User, "findOne").mockImplementation(
    async (query) => {
      if (
        query._id.toString() ===
        vendorA.toString()
      ) {
        return vendorOne;
      }

      if (
        query._id.toString() ===
        vendorB.toString()
      ) {
        return vendorTwo;
      }

      return null;
    }
  );

  vi.spyOn(User, "findById").mockResolvedValue({
    _id: customerId,
    name: "Test Customer",
    email: "customer@test.com",
  });

  vi.spyOn(Product, "findOneAndUpdate").mockImplementation(
    async (query) => {
      if (
        query._id.toString() ===
        productA.toString()
      ) {
        return productOne;
      }

      if (
        query._id.toString() ===
        productB.toString()
      ) {
        return productTwo;
      }

      return null;
    }
  );

  return {
    cart,
    productOne,
    productTwo,
    storeOne,
    storeTwo,
    vendorOne,
    vendorTwo,
  };
}

/*
=========================================================
RESET MOCKS
=========================================================
*/

beforeEach(() => {
  vi.restoreAllMocks();
});

/*
=========================================================
validateCart()
=========================================================
*/

describe("validateCart()", () => {
  it("rejects an empty cart", async () => {
    const cart = {
      customerId,
      items: [],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    await expect(
      validateCart(customerId)
    ).rejects.toThrow("Cart is empty");
  });

  it("rejects a cart when a product is unavailable", async () => {
    const cart = {
      customerId,
      items: [
        {
          productId: null,
          quantity: 1,
        },
      ],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    await expect(
      validateCart(customerId)
    ).rejects.toThrow(
      "One or more products are no longer available"
    );
  });

  it("validates a normal product and calculates the server-side total", async () => {
    const product = makeProduct({
      price: 500,
      stock: 10,
    });

    const store = makeStore();
    const vendor = makeVendor();

    const cart = {
      customerId,
      items: [
        {
          productId: product,
          quantity: 2,
        },
      ],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    vi.spyOn(Product, "findById").mockResolvedValue(
      product
    );

    vi.spyOn(Store, "findOne").mockResolvedValue(
      store
    );

    vi.spyOn(User, "findOne").mockResolvedValue(
      vendor
    );

    const result =
      await validateCart(customerId);

    expect(result.total).toBe(1000);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].price).toBe(500);
    expect(result.items[0].quantity).toBe(2);
  });

  it("uses variant price and variant stock", async () => {
    const product = makeProduct({
      price: 999,
      stock: 1,
      variants: [
        makeVariant({
          price: 250,
          stock: 5,
        }),
      ],
    });

    const store = makeStore();
    const vendor = makeVendor();

    const cart = {
      customerId,
      items: [
        {
          productId: product,
          quantity: 2,
          variantId: variantA,
        },
      ],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    vi.spyOn(Product, "findById").mockResolvedValue(
      product
    );

    vi.spyOn(Store, "findOne").mockResolvedValue(
      store
    );

    vi.spyOn(User, "findOne").mockResolvedValue(
      vendor
    );

    const result =
      await validateCart(customerId);

    expect(result.total).toBe(500);
    expect(result.items[0].price).toBe(250);
    expect(result.items[0].quantity).toBe(2);
    expect(
      result.items[0].variantId.toString()
    ).toBe(variantA.toString());
  });

  it("rejects a variant product when no variant is selected", async () => {
    const product = makeProduct({
      variants: [
        makeVariant(),
      ],
    });

    const cart = {
      customerId,
      items: [
        {
          productId: product,
          quantity: 1,
        },
      ],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    vi.spyOn(Product, "findById").mockResolvedValue(
      product
    );

    vi.spyOn(Store, "findOne").mockResolvedValue(
      makeStore()
    );

    vi.spyOn(User, "findOne").mockResolvedValue(
      makeVendor()
    );

    await expect(
      validateCart(customerId)
    ).rejects.toThrow(
      "Please select a variant for Test Product"
    );
  });

  it("rejects insufficient variant stock", async () => {
    const product = makeProduct({
      variants: [
        makeVariant({
          stock: 2,
        }),
      ],
    });

    const store = makeStore();
    const vendor = makeVendor();

    const cart = {
      customerId,
      items: [
        {
          productId: product,
          quantity: 5,
          variantId: variantA,
        },
      ],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    vi.spyOn(Product, "findById").mockResolvedValue(
      product
    );

    vi.spyOn(Store, "findOne").mockResolvedValue(
      store
    );

    vi.spyOn(User, "findOne").mockResolvedValue(
      vendor
    );

    await expect(
      validateCart(customerId)
    ).rejects.toThrow(
      "Insufficient stock for Test Product for the selected variant"
    );
  });

  it("supports products from multiple stores", async () => {
    const productOne = makeProduct({
      id: productA,
      name: "Product A",
      price: 100,
      vendorId: vendorA,
      storeId: storeA,
    });

    const productTwo = makeProduct({
      id: productB,
      name: "Product B",
      price: 200,
      vendorId: vendorB,
      storeId: storeB,
    });

    const cart = {
      customerId,
      items: [
        {
          productId: productOne,
          quantity: 2,
        },
        {
          productId: productTwo,
          quantity: 3,
        },
      ],
    };

    vi.spyOn(Cart, "findOne").mockReturnValue({
      populate: vi.fn().mockResolvedValue(cart),
    });

    vi.spyOn(Product, "findById").mockImplementation(
      async (id) => {
        if (
          id.toString() ===
          productA.toString()
        ) {
          return productOne;
        }

        if (
          id.toString() ===
          productB.toString()
        ) {
          return productTwo;
        }

        return null;
      }
    );

    vi.spyOn(Store, "findOne").mockImplementation(
      async (query) => {
        if (
          query._id.toString() ===
          storeA.toString()
        ) {
          return makeStore({
            id: storeA,
            vendorId: vendorA,
          });
        }

        if (
          query._id.toString() ===
          storeB.toString()
        ) {
          return makeStore({
            id: storeB,
            vendorId: vendorB,
          });
        }

        return null;
      }
    );

    vi.spyOn(User, "findOne").mockImplementation(
      async (query) => {
        if (
          query._id.toString() ===
          vendorA.toString()
        ) {
          return makeVendor({
            id: vendorA,
          });
        }

        if (
          query._id.toString() ===
          vendorB.toString()
        ) {
          return makeVendor({
            id: vendorB,
          });
        }

        return null;
      }
    );

    const result =
      await validateCart(customerId);

    expect(result.total).toBe(800);
    expect(result.storeGroups).toHaveLength(2);
    expect(result.storeGroups[0].total).toBe(200);
    expect(result.storeGroups[1].total).toBe(600);
  });
});

/*
=========================================================
validateBuyNowItem()
=========================================================
*/

describe("validateBuyNowItem()", () => {
  it("rejects missing product", async () => {
    vi.spyOn(Product, "findById")
      .mockResolvedValue(null);

    await expect(
      validateBuyNowItem(
        customerId,
        productA,
        1
      )
    ).rejects.toThrow(
      "This product is no longer available"
    );
  });

  it("rejects invalid quantity", async () => {
    await expect(
      validateBuyNowItem(
        customerId,
        productA,
        0
      )
    ).rejects.toThrow(
      "Invalid quantity"
    );
  });

  it("uses variant price for Buy Now", async () => {
    const product = makeProduct({
      price: 999,
      variants: [
        makeVariant({
          price: 350,
          stock: 10,
        }),
      ],
    });

    const store = makeStore();
    const vendor = makeVendor();

    vi.spyOn(Product, "findById")
      .mockResolvedValue(product);

    vi.spyOn(Store, "findOne")
      .mockResolvedValue(store);

    vi.spyOn(User, "findOne")
      .mockResolvedValue(vendor);

    const result =
      await validateBuyNowItem(
        customerId,
        productA,
        2,
        variantA
      );

    expect(result.total).toBe(700);
    expect(result.items[0].price).toBe(350);

    expect(
      result.items[0].variantId.toString()
    ).toBe(
      variantA.toString()
    );
  });

  it("rejects Buy Now when variant is required but missing", async () => {
    const product = makeProduct({
      variants: [
        makeVariant(),
      ],
    });

    vi.spyOn(Product, "findById")
      .mockResolvedValue(product);

    await expect(
      validateBuyNowItem(
        customerId,
        productA,
        1
      )
    ).rejects.toThrow(
      "Please select a product variant"
    );
  });
});

/*
=========================================================
reserveStock()
=========================================================
*/

describe("reserveStock()", () => {
  it("reserves normal product stock", async () => {
    const updatedProduct =
      makeProduct({
        stock: 8,
      });

    const spy =
      vi.spyOn(
        Product,
        "findOneAndUpdate"
      ).mockResolvedValue(
        updatedProduct
      );

    const items = [
      {
        productId: productA,
        quantity: 2,
        variantId: null,
      },
    ];

    const result =
      await reserveStock(items);

    expect(result).toHaveLength(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("reserves variant stock", async () => {
    const updatedProduct =
      makeProduct({
        variants: [
          makeVariant({
            stock: 8,
          }),
        ],
      });

    const spy =
      vi.spyOn(
        Product,
        "findOneAndUpdate"
      ).mockResolvedValue(
        updatedProduct
      );

    const items = [
      {
        productId: productA,
        quantity: 2,
        variantId: variantA,
      },
    ];

    const result =
      await reserveStock(items);

    expect(result).toHaveLength(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("rolls back previously reserved stock when a later item fails", async () => {
    const findOneAndUpdate =
      vi.spyOn(
        Product,
        "findOneAndUpdate"
      )
        .mockImplementationOnce(
          async () => ({
            _id: productA,
          })
        )
        .mockImplementationOnce(
          async () => null
        );

    const findByIdAndUpdate =
      vi.spyOn(
        Product,
        "findByIdAndUpdate"
      ).mockResolvedValue({
        _id: productA,
      });

    const items = [
      {
        productId: productA,
        quantity: 2,
        variantId: null,
        name: "Product A",
      },
      {
        productId: productB,
        quantity: 3,
        variantId: null,
        name: "Product B",
      },
    ];

    await expect(
      reserveStock(items)
    ).rejects.toThrow(
      "Insufficient stock for Product B"
    );

    expect(
      findOneAndUpdate
    ).toHaveBeenCalledTimes(2);

    expect(
      findByIdAndUpdate
    ).toHaveBeenCalledTimes(1);
  });
});

/*
=========================================================
createOrdersFromCart()
=========================================================
*/

describe("createOrdersFromCart()", () => {
  it("creates one order per store", async () => {
    setupMultiStoreCart();

    const createdOrders = [];

    const orderCreate =
      vi.spyOn(
        Order,
        "create"
      ).mockImplementation(
        async (data) => {
          const order = {
            ...data,
            _id:
              new mongoose.Types.ObjectId(),
          };

          createdOrders.push(
            order
          );

          return order;
        }
      );

    const result =
      await createOrdersFromCart({
        customerId,

        shippingAddress: {
          fullName:
            "Test Customer",
          phone:
            "9999999999",
          addressLine:
            "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode:
            "110001",
        },

        paymentStatus:
          "PAID",

        razorpayOrderId:
          "pay_order_123",

        razorpayPaymentId:
          "pay_payment_123",
      });

    expect(
      result.orders
    ).toHaveLength(2);

    expect(
      orderCreate
    ).toHaveBeenCalledTimes(2);

    expect(
      result.orders[0].storeId.toString()
    ).toBe(
      storeA.toString()
    );

    expect(
      result.orders[1].storeId.toString()
    ).toBe(
      storeB.toString()
    );
  });

  it("creates the correct total for each store order", async () => {
    setupMultiStoreCart();

    const createdOrders = [];

    vi.spyOn(
      Order,
      "create"
    ).mockImplementation(
      async (data) => {
        const order = {
          ...data,
          _id:
            new mongoose.Types.ObjectId(),
        };

        createdOrders.push(
          order
        );

        return order;
      }
    );

    const result =
      await createOrdersFromCart({
        customerId,

        shippingAddress: {
          fullName:
            "Test Customer",
          phone:
            "9999999999",
          addressLine:
            "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode:
            "110001",
        },

        paymentStatus:
          "PAID",

        razorpayOrderId:
          "pay_order_123",

        razorpayPaymentId:
          "pay_payment_123",
      });

    expect(
      result.orders[0].total
    ).toBe(200);

    expect(
      result.orders[1].total
    ).toBe(600);

    expect(
      result.total
    ).toBe(800);
  });

  it("uses the same Razorpay order and payment IDs for every store order", async () => {
    setupMultiStoreCart();

    const orderCreate =
      vi.spyOn(
        Order,
        "create"
      ).mockImplementation(
        async (data) => ({
          ...data,
          _id:
            new mongoose.Types.ObjectId(),
        })
      );

    await createOrdersFromCart({
      customerId,

      shippingAddress: {
        fullName:
          "Test Customer",
        phone:
          "9999999999",
        addressLine:
          "123 Test Street",
        city: "Delhi",
        state: "Delhi",
        pincode:
          "110001",
      },

      paymentStatus:
        "PAID",

      razorpayOrderId:
        "order_shared_123",

      razorpayPaymentId:
        "payment_shared_456",
    });

    expect(
      orderCreate
    ).toHaveBeenCalledTimes(2);

    const firstOrder =
      orderCreate.mock
        .calls[0][0];

    const secondOrder =
      orderCreate.mock
        .calls[1][0];

    expect(
      firstOrder.razorpayOrderId
    ).toBe(
      "order_shared_123"
    );

    expect(
      secondOrder.razorpayOrderId
    ).toBe(
      "order_shared_123"
    );

    expect(
      firstOrder.razorpayPaymentId
    ).toBe(
      "payment_shared_456"
    );

    expect(
      secondOrder.razorpayPaymentId
    ).toBe(
      "payment_shared_456"
    );
  });

  it("clears the cart only after all orders are successfully created", async () => {
    const { cart } =
      setupMultiStoreCart();

    vi.spyOn(
      Order,
      "create"
    ).mockImplementation(
      async (data) => ({
        ...data,
        _id:
          new mongoose.Types.ObjectId(),
      })
    );

    await createOrdersFromCart({
      customerId,

      shippingAddress: {
        fullName:
          "Test Customer",
        phone:
          "9999999999",
        addressLine:
          "123 Test Street",
        city: "Delhi",
        state: "Delhi",
        pincode:
          "110001",
      },

      paymentStatus:
        "PAID",

      razorpayOrderId:
        "order_123",

      razorpayPaymentId:
        "payment_456",
    });

    expect(
      cart.items
    ).toEqual([]);

    expect(
      cart.save
    ).toHaveBeenCalledTimes(1);
  });

  it("deletes created orders and restores stock when a later order creation fails", async () => {
    setupMultiStoreCart();

    const orderOne = {
      _id:
        new mongoose.Types.ObjectId(),
      storeId: storeA,
    };

    const orderCreate =
      vi.spyOn(
        Order,
        "create"
      )
        .mockResolvedValueOnce(
          orderOne
        )
        .mockRejectedValueOnce(
          new Error(
            "Second order creation failed"
          )
        );

    const deleteMany =
      vi.spyOn(
        Order,
        "deleteMany"
      ).mockResolvedValue({
        acknowledged:
          true,
        deletedCount: 1,
      });

    const findByIdAndUpdate =
      vi.spyOn(
        Product,
        "findByIdAndUpdate"
      ).mockResolvedValue({
        _id: productA,
      });

    await expect(
      createOrdersFromCart({
        customerId,

        shippingAddress: {
          fullName:
            "Test Customer",
          phone:
            "9999999999",
          addressLine:
            "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode:
            "110001",
        },

        paymentStatus:
          "PAID",

        razorpayOrderId:
          "order_123",

        razorpayPaymentId:
          "payment_456",
      })
    ).rejects.toThrow(
      "Second order creation failed"
    );

    expect(
      orderCreate
    ).toHaveBeenCalledTimes(2);

    expect(
      deleteMany
    ).toHaveBeenCalledTimes(1);

    expect(
      deleteMany
    ).toHaveBeenCalledWith({
      _id: {
        $in: [
          orderOne._id,
        ],
      },
    });

    /*
    Two normal products were
    reserved, so rollback must
    restore both.
    */

    expect(
      findByIdAndUpdate
    ).toHaveBeenCalledTimes(2);
  });
});