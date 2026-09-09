import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

/* =========================================================
   ENV
========================================================= */

process.env.JWT_SECRET = "test-secret";
process.env.RAZORPAY_KEY_ID = "test-key";
process.env.RAZORPAY_KEY_SECRET = "test-secret";
process.env.STRIPE_SECRET_KEY = "test-stripe-key";

/* =========================================================
   HELPERS
========================================================= */

const ids = {
  admin: "507f1f77bcf86cd799439011",
  vendor: "507f1f77bcf86cd799439012",
  vendor2: "507f1f77bcf86cd799439013",
  customer: "507f1f77bcf86cd799439014",
  otherCustomer: "507f1f77bcf86cd799439015",

  store: "507f1f77bcf86cd799439021",
  store2: "507f1f77bcf86cd799439022",

  product: "507f1f77bcf86cd799439031",
  product2: "507f1f77bcf86cd799439032",

  variantRed: "507f1f77bcf86cd799439041",
  variantBlue: "507f1f77bcf86cd799439042",

  order: "507f1f77bcf86cd799439051",
  order2: "507f1f77bcf86cd799439052",

  unknown: "507f1f77bcf86cd799439099",
};

/*
 * Test IDs intentionally remain plain strings.
 *
 * Production Mongoose ObjectIds support .toString(), while
 * strings also support .toString(). Keeping the test IDs as
 * strings makes controller expectations deterministic.
 */
function oid(id) {
  return id;
}

function makeQuery(value) {
  return {
    populate: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    then: (resolve, reject) =>
      Promise.resolve(value).then(resolve, reject),
    catch: (reject) =>
      Promise.resolve(value).catch(reject),
  };
}

function makeSavedDocument(data = {}) {
  return {
    ...data,
    save: vi.fn().mockResolvedValue(undefined),
    populate: vi.fn().mockResolvedValue(undefined),
  };
}

function tokenFor(userId) {
  return jwt.sign(
    {
      userId,
      role:
        userId === ids.admin
          ? "SUPER_ADMIN"
          : userId === ids.vendor ||
              userId === ids.vendor2
            ? "VENDOR"
            : "CUSTOMER",
    },
    process.env.JWT_SECRET
  );
}

function auth(userId) {
  return {
    Authorization: `Bearer ${tokenFor(userId)}`,
  };
}

const shippingAddress = {
  fullName: "Test Customer",
  phone: "9999999999",
  addressLine: "123 Test Street",
  city: "Delhi",
  state: "Delhi",
  pincode: "110001",
};

/* =========================================================
   MOCKS
========================================================= */

vi.mock("razorpay", () => ({
  default: class Razorpay {
    constructor() {}

    orders = {
      create: vi.fn(),
      fetch: vi.fn(),
    };
  },
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    constructor() {}

    checkout = {
      sessions: {
        create: vi.fn(),
      },
    };

    webhooks = {
      constructEvent: vi.fn(),
    };
  },
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

/* =========================================================
   MODEL MOCKS
========================================================= */

const User = {
  find: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  findByIdAndDelete: vi.fn(),
};

const Store = {
  find: vi.fn(),
  findOne: vi.fn(),
  findById: vi.fn(),
  findOneAndDelete: vi.fn(),
  create: vi.fn(),
  countDocuments: vi.fn(),
};

const Product = {
  find: vi.fn(),
  findById: vi.fn(),
  findOne: vi.fn(),
  findOneAndDelete: vi.fn(),
  create: vi.fn(),
  findOneAndUpdate: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  countDocuments: vi.fn(),
};

const Cart = {
  findOne: vi.fn(),
  create: vi.fn(),
};

const Order = {
  find: vi.fn(),
  findOne: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  countDocuments: vi.fn(),
  aggregate: vi.fn(),
};

vi.mock("../src/models/User.js", () => ({
  default: User,
}));

vi.mock("../src/models/Store.js", () => ({
  default: Store,
}));

vi.mock("../src/models/Product.js", () => ({
  default: Product,
}));

vi.mock("../src/models/Cart.js", () => ({
  default: Cart,
}));

vi.mock("../src/models/Order.js", () => ({
  default: Order,
}));

/* =========================================================
   ORDER SERVICE MOCK
========================================================= */

const createOrderFromCart = vi.fn();

vi.mock("../src/services/orderService.js", () => ({
  createOrderFromCart,
  createOrdersFromCart: vi.fn(),
  createOrderFromBuyNow: vi.fn(),
  validateCart: vi.fn(),
  validateBuyNowItem: vi.fn(),
  reserveStock: vi.fn(),
  restoreStock: vi.fn(),
}));

/* =========================================================
   APP
========================================================= */

const { default: app } = await import("../src/app.js");

/* =========================================================
   DEFAULT USER DATA
========================================================= */

function getUserById(id) {
  const users = {
    [ids.admin]: {
      _id: oid(ids.admin),
      name: "Admin User",
      email: "admin@test.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },

    [ids.vendor]: {
      _id: oid(ids.vendor),
      name: "Vendor One",
      email: "vendor@test.com",
      role: "VENDOR",
      status: "ACTIVE",
    },

    [ids.vendor2]: {
      _id: oid(ids.vendor2),
      name: "Vendor Two",
      email: "vendor2@test.com",
      role: "VENDOR",
      status: "ACTIVE",
    },

    [ids.customer]: {
      _id: oid(ids.customer),
      name: "Customer One",
      email: "customer@test.com",
      role: "CUSTOMER",
      status: "ACTIVE",
    },

    [ids.otherCustomer]: {
      _id: oid(ids.otherCustomer),
      name: "Customer Two",
      email: "customer2@test.com",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  };

  return users[String(id)] || null;
}

/* =========================================================
   DEFAULT FIXTURES
========================================================= */

function simpleProduct(overrides = {}) {
  return makeSavedDocument({
    _id: oid(ids.product),
    storeId: oid(ids.store),
    vendorId: oid(ids.vendor),
    name: "Wireless Mouse",
    description: "Test mouse",
    price: 999,
    stock: 10,
    category: "Electronics",
    subcategory: "Accessories",
    images: [],
    variants: [],
    active: true,
    ...overrides,
  });
}

function variantProduct(overrides = {}) {
  return makeSavedDocument({
    _id: oid(ids.product),
    storeId: oid(ids.store),
    vendorId: oid(ids.vendor),
    name: "Classic T-Shirt",
    description: "Test shirt",
    price: 799,
    stock: 15,
    category: "Fashion",
    subcategory: "T-Shirts",
    images: [],
    variants: [
      {
        _id: oid(ids.variantRed),
        options: new Map([
          ["color", "Red"],
          ["size", "M"],
        ]),
        price: 799,
        stock: 5,
      },
      {
        _id: oid(ids.variantBlue),
        options: new Map([
          ["color", "Blue"],
          ["size", "M"],
        ]),
        price: 849,
        stock: 10,
      },
    ],
    active: true,
    ...overrides,
  });
}

function store(overrides = {}) {
  return makeSavedDocument({
    _id: oid(ids.store),
    vendorId: oid(ids.vendor),
    name: "NovaTech",
    slug: "novatech",
    description: "Technology store",
    logo: "",
    banner: "",
    status: "ACTIVE",
    ...overrides,
  });
}

function order(overrides = {}) {
  return makeSavedDocument({
    _id: oid(ids.order),
    customerId: oid(ids.customer),
    storeId: oid(ids.store),
    vendorId: oid(ids.vendor),
    items: [
      {
        productId: oid(ids.product),
        variantId: null,
        quantity: 2,
        price: 999,
      },
    ],
    total: 1998,
    shippingAddress,
    paymentStatus: "PENDING",
    status: "PLACED",
    ...overrides,
  });
}

/* =========================================================
   RESET MOCKS
========================================================= */

beforeEach(() => {
  vi.clearAllMocks();

  /*
   * Authentication lookup.
   *
   * IMPORTANT:
   * This implementation must remain active for admin delete
   * tests because protect() also uses User.findById().
   */
  User.findById.mockImplementation((id) =>
    makeQuery(getUserById(id))
  );

  /* Safe defaults */
  User.find.mockReturnValue(makeQuery([]));
  User.findOne.mockReturnValue(makeQuery(null));
  User.create.mockResolvedValue(null);
  User.findByIdAndDelete.mockResolvedValue(null);

  Store.find.mockReturnValue(makeQuery([]));
  Store.findOne.mockReturnValue(makeQuery(null));
  Store.findById.mockReturnValue(makeQuery(null));
  Store.findOneAndDelete.mockReturnValue(makeQuery(null));
  Store.create.mockResolvedValue(null);
  Store.countDocuments.mockResolvedValue(0);

  Product.find.mockReturnValue(makeQuery([]));
  Product.findById.mockReturnValue(makeQuery(null));
  Product.findOne.mockReturnValue(makeQuery(null));
  Product.findOneAndDelete.mockReturnValue(makeQuery(null));
  Product.create.mockResolvedValue(null);
  Product.findOneAndUpdate.mockReturnValue(makeQuery(null));
  Product.findByIdAndUpdate.mockReturnValue(makeQuery(null));
  Product.countDocuments.mockResolvedValue(0);

  Cart.findOne.mockReturnValue(makeQuery(null));
  Cart.create.mockResolvedValue(null);

  Order.find.mockReturnValue(makeQuery([]));
  Order.findOne.mockReturnValue(makeQuery(null));
  Order.findById.mockReturnValue(makeQuery(null));
  Order.create.mockResolvedValue(null);
  Order.countDocuments.mockResolvedValue(0);
  Order.aggregate.mockResolvedValue([]);

  createOrderFromCart.mockReset();
});

/* =========================================================
   HEALTH + GLOBAL AUTH
========================================================= */

describe("Health and authentication", () => {
  it("GET /api/health returns healthy response", async () => {
    const res = await request(app)
      .get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      service: "shop-sphere-api",
    });
  });

  it("protected route rejects missing authentication", async () => {
    const res = await request(app)
      .get("/api/cart");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "Authentication required"
    );
  });

  it("protected route rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "Invalid or expired token"
    );
  });
});

/* =========================================================
   STORE API
========================================================= */

describe("Store API", () => {
  it("lists active public stores", async () => {
    Store.find.mockReturnValue(
      makeQuery([
        {
          ...store(),
          vendorId: {
            _id: ids.vendor,
            name: "Vendor One",
            email: "vendor@test.com",
            status: "ACTIVE",
          },
        },
      ])
    );

    const res = await request(app)
      .get("/api/stores");

    expect(res.status).toBe(200);
    expect(res.body.stores).toHaveLength(1);
  });

  it("gets an active store by slug", async () => {
    Store.findOne.mockReturnValue(
      makeQuery({
        ...store(),
        vendorId: {
          _id: ids.vendor,
          name: "Vendor One",
          email: "vendor@test.com",
          status: "ACTIVE",
        },
      })
    );

    const res = await request(app)
      .get("/api/stores/slug/NOVATECH");

    expect(res.status).toBe(200);
    expect(res.body.store.slug).toBe("novatech");
  });

  it("returns 404 for missing public store", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .get("/api/stores/slug/missing-store");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Store not found"
    );
  });

  it("vendor can list their stores", async () => {
    Store.find.mockReturnValue(
      makeQuery([store()])
    );

    const res = await request(app)
      .get("/api/stores/vendor")
      .set(auth(ids.vendor));

    expect(res.status).toBe(200);
    expect(res.body.stores).toHaveLength(1);
  });

  it("customer cannot access vendor stores endpoint", async () => {
    const res = await request(app)
      .get("/api/stores/vendor")
      .set(auth(ids.customer));

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("vendor can create a store", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(null)
    );

    const createdStore = store();

    Store.create.mockResolvedValue(
      createdStore
    );

    const res = await request(app)
      .post("/api/stores")
      .set(auth(ids.vendor))
      .send({
        name: "  My Store  ",
        slug: "  MY-STORE  ",
        description: "  My description  ",
      });

    expect(res.status).toBe(201);
    expect(res.body.store).toBeTruthy();

    expect(Store.create).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorId: ids.vendor,
        name: "My Store",
        slug: "my-store",
        description: "My description",
      })
    );
  });

  it("rejects store without name or slug", async () => {
    const res = await request(app)
      .post("/api/stores")
      .set(auth(ids.vendor))
      .send({
        name: "Only Name",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Store name and slug are required"
    );
  });

  it("rejects empty store name", async () => {
    const res = await request(app)
      .post("/api/stores")
      .set(auth(ids.vendor))
      .send({
        name: "   ",
        slug: "valid-slug",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Store name cannot be empty"
    );
  });

  it("rejects duplicate store slug", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(store())
    );

    const res = await request(app)
      .post("/api/stores")
      .set(auth(ids.vendor))
      .send({
        name: "Another Store",
        slug: "novatech",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(
      "Slug already exists"
    );
  });

  it("vendor can update their own store", async () => {
    const existingStore = store();

    Store.findOne
      .mockReturnValueOnce(
        makeQuery(existingStore)
      )
      .mockReturnValueOnce(
        makeQuery(null)
      );

    const res = await request(app)
      .put(`/api/stores/${ids.store}`)
      .set(auth(ids.vendor))
      .send({
        name: "Updated Store",
        slug: "updated-store",
        description: "Updated description",
      });

    expect(res.status).toBe(200);
    expect(existingStore.name).toBe(
      "Updated Store"
    );
    expect(existingStore.slug).toBe(
      "updated-store"
    );
  });

  it("vendor cannot update another vendor's store", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .put(`/api/stores/${ids.store}`)
      .set(auth(ids.vendor2))
      .send({
        name: "Hacked Store",
        slug: "hacked-store",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(
      "Store not found"
    );
  });

  it("rejects duplicate slug during store update", async () => {
    Store.findOne
      .mockReturnValueOnce(
        makeQuery(store())
      )
      .mockReturnValueOnce(
        makeQuery(
          store({
            _id: oid(ids.store2),
            slug: "taken-slug",
          })
        )
      );

    const res = await request(app)
      .put(`/api/stores/${ids.store}`)
      .set(auth(ids.vendor))
      .send({
        name: "Updated",
        slug: "taken-slug",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(
      "Slug already exists"
    );
  });

  it("vendor can delete their own store", async () => {
    Store.findOneAndDelete.mockReturnValue(
      makeQuery(store())
    );

    const res = await request(app)
      .delete(`/api/stores/${ids.store}`)
      .set(auth(ids.vendor));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Store deleted successfully"
    );
  });

  it("vendor cannot delete another vendor's store", async () => {
    Store.findOneAndDelete.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .delete(`/api/stores/${ids.store}`)
      .set(auth(ids.vendor2));

    expect(res.status).toBe(404);
  });
});

/* =========================================================
   PRODUCT API
========================================================= */

describe("Product API", () => {
it("lists public active products", async () => {
  Store.find.mockReturnValue(
    makeQuery([
      {
        _id: ids.store,
        vendorId: ids.vendor,
      },
    ])
  );

  Product.find.mockReturnValue(
    makeQuery([
      {
        ...simpleProduct(),
        storeId: {
          _id: ids.store,
          name: "NovaTech",
          slug: "novatech",
          status: "ACTIVE",
          vendorId: ids.vendor,
        },
        vendorId: {
          _id: ids.vendor,
          name: "Vendor One",
          email: "vendor@test.com",
          status: "ACTIVE",
        },
      },
    ])
  );

  const res = await request(app)
    .get("/api/products");

  expect(res.status).toBe(200);
  expect(res.body.products).toHaveLength(1);
  expect(res.body.pagination).toEqual(
    expect.objectContaining({
      page: 1,
      limit: 12,
      total: 1,
      pages: 1,
    })
  );
});

  it("supports product search", async () => {
    Store.find.mockReturnValue(
      makeQuery([
        {
          _id: ids.store,
          vendorId: ids.vendor,
        },
      ])
    );

    Product.find.mockReturnValue(
      makeQuery([])
    );

    const res = await request(app)
      .get("/api/products?search=mouse");

    expect(res.status).toBe(200);

    const filter =
      Product.find.mock.calls[0][0];

    expect(filter.$or).toBeDefined();
    expect(filter.$or).toHaveLength(2);
  });

  it("supports category and price filters", async () => {
    Store.find.mockReturnValue(
      makeQuery([])
    );

    Product.find.mockReturnValue(
      makeQuery([])
    );

    const res = await request(app)
      .get(
        "/api/products?category=Electronics&subcategory=Accessories&minPrice=500&maxPrice=1500"
      );

    expect(res.status).toBe(200);

    const filter =
      Product.find.mock.calls[0][0];

    expect(filter.category).toBe(
      "Electronics"
    );
    expect(filter.subcategory).toBe(
      "Accessories"
    );
    expect(filter.price).toEqual({
      $gte: 500,
      $lte: 1500,
    });
  });

  it("supports pagination and maximum limit", async () => {
    Store.find.mockReturnValue(
      makeQuery([
        {
          _id: ids.store,
          vendorId: ids.vendor,
        },
      ])
    );

    const products = Array.from(
      { length: 3 },
      (_, index) => ({
        ...simpleProduct({
          _id: oid(
            `507f1f77bcf86cd7994390${40 + index}`
          ),
          name: `Product ${index + 1}`,
        }),
        storeId: {
          _id: ids.store,
          name: "NovaTech",
          slug: "novatech",
          status: "ACTIVE",
          vendorId: {
            _id: ids.vendor,
            name: "Vendor One",
            email: "vendor@test.com",
            status: "ACTIVE",
          },
        },
        vendorId: {
          _id: ids.vendor,
          name: "Vendor One",
          email: "vendor@test.com",
          status: "ACTIVE",
        },
      })
    );

    Product.find.mockReturnValue(
      makeQuery(products)
    );

    const res = await request(app)
      .get("/api/products?page=2&limit=100");

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(50);
  });

  it("vendor can list their products", async () => {
    Product.find.mockReturnValue(
      makeQuery([simpleProduct()])
    );

    const res = await request(app)
      .get("/api/products/vendor")
      .set(auth(ids.vendor));

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
  });

  it("customer cannot access vendor products endpoint", async () => {
    const res = await request(app)
      .get("/api/products/vendor")
      .set(auth(ids.customer));

    expect(res.status).toBe(403);
  });

  it("vendor can create a simple product", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(store())
    );

    Product.create.mockResolvedValue(
      simpleProduct()
    );

    const res = await request(app)
      .post("/api/products")
      .set(auth(ids.vendor))
      .send({
        storeId: ids.store,
        name: "  Wireless Mouse  ",
        description: "  Great mouse  ",
        category: " Electronics ",
        subcategory: " Accessories ",
        price: 999,
        stock: 10,
      });

    expect(res.status).toBe(201);

    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: ids.store,
        vendorId: ids.vendor,
        name: "Wireless Mouse",
        description: "Great mouse",
        category: "Electronics",
        subcategory: "Accessories",
        price: 999,
        stock: 10,
      })
    );
  });

  it("rejects simple product without price", async () => {
    const res = await request(app)
      .post("/api/products")
      .set(auth(ids.vendor))
      .send({
        storeId: ids.store,
        name: "Mouse",
        stock: 5,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Price is required for products without variants"
    );
  });

  it("vendor can create a variant product", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(store())
    );

    Product.create.mockResolvedValue(
      variantProduct()
    );

    const res = await request(app)
      .post("/api/products")
      .set(auth(ids.vendor))
      .send({
        storeId: ids.store,
        name: "Classic T-Shirt",
        variants: [
          {
            options: {
              Color: " Red ",
              Size: " M ",
            },
            price: 799,
            stock: 5,
          },
          {
            options: {
              color: "Blue",
              size: "M",
            },
            price: 849,
            stock: 10,
          },
        ],
      });

    expect(res.status).toBe(201);

    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        price: 799,
        stock: 15,
        variants: [
          {
            options: {
              color: "Red",
              size: "M",
            },
            price: 799,
            stock: 5,
          },
          {
            options: {
              color: "Blue",
              size: "M",
            },
            price: 849,
            stock: 10,
          },
        ],
      })
    );
  });

  it("rejects duplicate variant combinations", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(store())
    );

    const res = await request(app)
      .post("/api/products")
      .set(auth(ids.vendor))
      .send({
        storeId: ids.store,
        name: "T-Shirt",
        variants: [
          {
            options: {
              color: "Red",
              size: "M",
            },
            price: 799,
            stock: 5,
          },
          {
            options: {
              color: "Red",
              size: "M",
            },
            price: 899,
            stock: 5,
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Duplicate variant option combinations are not allowed"
    );
  });

  it("rejects invalid variant stock", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(store())
    );

    const res = await request(app)
      .post("/api/products")
      .set(auth(ids.vendor))
      .send({
        storeId: ids.store,
        name: "T-Shirt",
        variants: [
          {
            options: {
              size: "M",
            },
            price: 799,
            stock: 2.5,
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Each variant stock must be a valid non-negative integer"
    );
  });

  it("rejects product for store vendor does not own", async () => {
    Store.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .post("/api/products")
      .set(auth(ids.vendor2))
      .send({
        storeId: ids.store,
        name: "Unauthorized Product",
        price: 100,
        stock: 1,
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "You do not own this active store"
    );
  });

it("gets an active product", async () => {
  Product.findById.mockReturnValue(
    makeQuery({
      ...simpleProduct(),
      storeId: {
        _id: ids.store,
        name: "NovaTech",
        slug: "novatech",
        status: "ACTIVE",
        vendorId: ids.vendor,
      },
      vendorId: {
        _id: ids.vendor,
        name: "Vendor One",
        email: "vendor@test.com",
        status: "ACTIVE",
      },
    })
  );

  const res = await request(app)
    .get(`/api/products/${ids.product}`);

  expect(res.status).toBe(200);
  expect(res.body.product).toBeTruthy();
});

  it("returns 404 for unavailable product", async () => {
    Product.findById.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .get(`/api/products/${ids.product}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Product is no longer available"
    );
  });

  it("vendor can update their product", async () => {
    const product = simpleProduct();

    Product.findOne.mockReturnValue(
      makeQuery(product)
    );

    const res = await request(app)
      .put(`/api/products/${ids.product}`)
      .set(auth(ids.vendor))
      .send({
        name: "Updated Mouse",
        price: 1099,
        stock: 7,
      });

    expect(res.status).toBe(200);
    expect(product.name).toBe(
      "Updated Mouse"
    );
  });

  it("vendor cannot update another vendor's product", async () => {
    Product.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .put(`/api/products/${ids.product}`)
      .set(auth(ids.vendor2))
      .send({
        name: "Hacked",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Product not found"
    );
  });

  it("vendor can delete their product", async () => {
    Product.findOneAndDelete.mockReturnValue(
      makeQuery(simpleProduct())
    );

    const res = await request(app)
      .delete(`/api/products/${ids.product}`)
      .set(auth(ids.vendor));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Product deleted successfully"
    );
  });
});

/* =========================================================
   CART API
========================================================= */

describe("Cart API", () => {
  it("creates and returns an empty cart", async () => {
    const cart = makeSavedDocument({
      _id: oid("507f1f77bcf86cd799439061"),
      customerId: oid(ids.customer),
      items: [],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(null)
    );

    Cart.create.mockResolvedValue(cart);

    const res = await request(app)
      .get("/api/cart")
      .set(auth(ids.customer));

    expect(res.status).toBe(200);
    expect(res.body.cart).toBeTruthy();

    expect(Cart.create).toHaveBeenCalledWith({
      customerId: ids.customer,
      items: [],
    });
  });

  it("returns existing cart", async () => {
    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .get("/api/cart")
      .set(auth(ids.customer));

    expect(res.status).toBe(200);
    expect(res.body.cart).toBeTruthy();
  });

  it("customer can add simple product to cart", async () => {
    const product = simpleProduct();

    Product.findById.mockReturnValue(
      makeQuery(product)
    );

    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        quantity: 2,
      });

    expect(res.status).toBe(200);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
  });

  it("rejects add to cart without product ID", async () => {
    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        quantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Product ID is required."
    );
  });

  it("rejects invalid cart quantity", async () => {
    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        quantity: 0,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Quantity must be at least 1."
    );
  });

  it("rejects inactive product", async () => {
    Product.findById.mockReturnValue(
      makeQuery(
        simpleProduct({
          active: false,
        })
      )
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        quantity: 1,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Product not found."
    );
  });

  it("requires variant for variant product", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        quantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Please select a product variant."
    );
  });

  it("adds a selected variant to cart", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        variantId: ids.variantRed,
        quantity: 2,
      });

    expect(res.status).toBe(200);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].variantId).toBe(
      ids.variantRed
    );
    expect(cart.items[0].quantity).toBe(2);
  });

  it("rejects nonexistent variant", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        variantId: ids.unknown,
        quantity: 1,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Selected variant not found."
    );
  });

  it("rejects variant quantity above stock", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        variantId: ids.variantRed,
        quantity: 6,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Only 5 items available"
    );
  });

  it("rejects variant ID for simple product", async () => {
    Product.findById.mockReturnValue(
      makeQuery(simpleProduct())
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        variantId: ids.variantRed,
        quantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "This product does not have variants."
    );
  });

  it("rejects simple product quantity above stock", async () => {
    Product.findById.mockReturnValue(
      makeQuery(
        simpleProduct({
          stock: 3,
        })
      )
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        quantity: 4,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Only 3 items available"
    );
  });

  it("combines same product and same variant", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [
        {
          productId: oid(ids.product),
          variantId: oid(ids.variantRed),
          quantity: 2,
        },
      ],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        variantId: ids.variantRed,
        quantity: 2,
      });

    expect(res.status).toBe(200);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(4);
  });

  it("keeps different variants as separate cart items", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [
        {
          productId: oid(ids.product),
          variantId: oid(ids.variantRed),
          quantity: 1,
        },
      ],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .post("/api/cart/items")
      .set(auth(ids.customer))
      .send({
        productId: ids.product,
        variantId: ids.variantBlue,
        quantity: 1,
      });

    expect(res.status).toBe(200);
    expect(cart.items).toHaveLength(2);
  });

  it("updates a simple cart item quantity", async () => {
    Product.findById.mockReturnValue(
      makeQuery(simpleProduct())
    );

    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [
        {
          productId: oid(ids.product),
          variantId: null,
          quantity: 2,
        },
      ],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .put(`/api/cart/items/${ids.product}`)
      .set(auth(ids.customer))
      .send({
        quantity: 5,
      });

    expect(res.status).toBe(200);
    expect(cart.items[0].quantity).toBe(5);
  });

  it("updates a variant cart item quantity", async () => {
    Product.findById.mockReturnValue(
      makeQuery(variantProduct())
    );

    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [
        {
          productId: oid(ids.product),
          variantId: oid(ids.variantRed),
          quantity: 2,
        },
      ],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .put(`/api/cart/items/${ids.product}`)
      .set(auth(ids.customer))
      .send({
        variantId: ids.variantRed,
        quantity: 4,
      });

    expect(res.status).toBe(200);
    expect(cart.items[0].quantity).toBe(4);
  });

  it("rejects invalid update quantity", async () => {
    const res = await request(app)
      .put(`/api/cart/items/${ids.product}`)
      .set(auth(ids.customer))
      .send({
        quantity: 0,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Quantity must be at least 1."
    );
  });

  it("returns 404 when cart item does not exist", async () => {
    Product.findById.mockReturnValue(
      makeQuery(simpleProduct())
    );

    Cart.findOne.mockReturnValue(
      makeQuery(
        makeSavedDocument({
          customerId: oid(ids.customer),
          items: [],
        })
      )
    );

    const res = await request(app)
      .put(`/api/cart/items/${ids.product}`)
      .set(auth(ids.customer))
      .send({
        quantity: 2,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Cart item not found."
    );
  });

  it("removes a simple product from cart", async () => {
    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [
        {
          productId: oid(ids.product),
          variantId: null,
          quantity: 2,
        },
      ],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .delete(`/api/cart/items/${ids.product}`)
      .set(auth(ids.customer))
      .send({
        variantId: null,
      });

    expect(res.status).toBe(200);
    expect(cart.items).toHaveLength(0);
  });

  it("removes only the selected variant", async () => {
    const cart = makeSavedDocument({
      customerId: oid(ids.customer),
      items: [
        {
          productId: oid(ids.product),
          variantId: oid(ids.variantRed),
          quantity: 2,
        },
        {
          productId: oid(ids.product),
          variantId: oid(ids.variantBlue),
          quantity: 1,
        },
      ],
    });

    Cart.findOne.mockReturnValue(
      makeQuery(cart)
    );

    const res = await request(app)
      .delete(`/api/cart/items/${ids.product}`)
      .set(auth(ids.customer))
      .send({
        variantId: ids.variantRed,
      });

    expect(res.status).toBe(200);
    expect(cart.items).toHaveLength(1);
    expect(
      cart.items[0].variantId.toString()
    ).toBe(ids.variantBlue);
  });

  it("vendor cannot access customer cart", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set(auth(ids.vendor));

    expect(res.status).toBe(403);
  });
});

/* =========================================================
   ORDER API
========================================================= */

describe("Order API", () => {
  it("creates an order with a complete shipping address", async () => {
    const createdOrder = order();

    createOrderFromCart.mockResolvedValue(
      createdOrder
    );

    const res = await request(app)
      .post("/api/orders")
      .set(auth(ids.customer))
      .send({
        shippingAddress,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe(
      "Order placed successfully"
    );

    expect(
      createOrderFromCart
    ).toHaveBeenCalledWith({
      customerId: ids.customer,
      shippingAddress,
      paymentStatus: "PENDING",
    });
  });

  it("rejects incomplete shipping address", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set(auth(ids.customer))
      .send({
        shippingAddress: {
          fullName: "Customer",
          city: "Delhi",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Complete shipping address is required"
    );
  });

  it("returns order service errors as 400", async () => {
    createOrderFromCart.mockRejectedValue(
      new Error("Cart is empty")
    );

    const res = await request(app)
      .post("/api/orders")
      .set(auth(ids.customer))
      .send({
        shippingAddress,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Cart is empty"
    );
  });

  it("customer can view their orders", async () => {
    Order.find.mockReturnValue(
      makeQuery([order()])
    );

    const res = await request(app)
      .get("/api/orders/my")
      .set(auth(ids.customer));

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);

    expect(Order.find).toHaveBeenCalledWith({
      customerId: ids.customer,
    });
  });

  it("vendor can view their orders", async () => {
    Order.find.mockReturnValue(
      makeQuery([order()])
    );

    const res = await request(app)
      .get("/api/orders/vendor")
      .set(auth(ids.vendor));

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);

    expect(Order.find).toHaveBeenCalledWith({
      vendorId: ids.vendor,
    });
  });

  it("vendor cannot access customer orders", async () => {
    const res = await request(app)
      .get("/api/orders/my")
      .set(auth(ids.vendor));

    expect(res.status).toBe(403);
  });

  it("customer cannot access vendor orders", async () => {
    const res = await request(app)
      .get("/api/orders/vendor")
      .set(auth(ids.customer));

    expect(res.status).toBe(403);
  });

  it("vendor can update order status", async () => {
    const existingOrder = order();

    Order.findOne.mockReturnValue(
      makeQuery(existingOrder)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/status`
      )
      .set(auth(ids.vendor))
      .send({
        status: "SHIPPED",
      });

    expect(res.status).toBe(200);
    expect(existingOrder.status).toBe(
      "SHIPPED"
    );
  });

  it("rejects invalid order status", async () => {
    Order.findOne.mockReturnValue(
      makeQuery(order())
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/status`
      )
      .set(auth(ids.vendor))
      .send({
        status: "INVALID_STATUS",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Invalid order status"
    );
  });

  it("returns 404 when vendor does not own order", async () => {
    Order.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/status`
      )
      .set(auth(ids.vendor2))
      .send({
        status: "SHIPPED",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Order not found"
    );
  });

  it("cancelling a vendor order status restores normal product stock", async () => {
    const existingOrder = order({
      items: [
        {
          productId: oid(ids.product),
          variantId: null,
          quantity: 3,
          price: 999,
        },
      ],
      status: "PROCESSING",
    });

    Order.findOne.mockReturnValue(
      makeQuery(existingOrder)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/status`
      )
      .set(auth(ids.vendor))
      .send({
        status: "CANCELLED",
      });

    expect(res.status).toBe(200);
    expect(existingOrder.status).toBe(
      "CANCELLED"
    );

    expect(
      Product.findByIdAndUpdate
    ).toHaveBeenCalledWith(
      ids.product,
      {
        $inc: {
          stock: 3,
        },
      }
    );
  });

  it("cancelling a vendor order restores variant stock", async () => {
    const existingOrder = order({
      items: [
        {
          productId: oid(ids.product),
          variantId: oid(ids.variantRed),
          quantity: 2,
          price: 799,
        },
      ],
      status: "PROCESSING",
    });

    Order.findOne.mockReturnValue(
      makeQuery(existingOrder)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/status`
      )
      .set(auth(ids.vendor))
      .send({
        status: "CANCELLED",
      });

    expect(res.status).toBe(200);
    expect(existingOrder.status).toBe(
      "CANCELLED"
    );

    expect(
      Product.findOneAndUpdate
    ).toHaveBeenCalledWith(
      {
        _id: ids.product,
        "variants._id": ids.variantRed,
      },
      {
        $inc: {
          "variants.$.stock": 2,
        },
      }
    );
  });

  it("customer can cancel a placed order", async () => {
    const existingOrder = order({
      status: "PLACED",
    });

    Order.findOne.mockReturnValue(
      makeQuery(existingOrder)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/cancel`
      )
      .set(auth(ids.customer));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Order cancelled successfully"
    );
    expect(existingOrder.status).toBe(
      "CANCELLED"
    );
  });

  it("customer can cancel a processing order", async () => {
    const existingOrder = order({
      status: "PROCESSING",
    });

    Order.findOne.mockReturnValue(
      makeQuery(existingOrder)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/cancel`
      )
      .set(auth(ids.customer));

    expect(res.status).toBe(200);
    expect(existingOrder.status).toBe(
      "CANCELLED"
    );
  });

  it("cannot cancel an already cancelled order", async () => {
    Order.findOne.mockReturnValue(
      makeQuery(
        order({
          status: "CANCELLED",
        })
      )
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/cancel`
      )
      .set(auth(ids.customer));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Order is already cancelled"
    );
  });

  it("cannot cancel a shipped order", async () => {
    Order.findOne.mockReturnValue(
      makeQuery(
        order({
          status: "SHIPPED",
        })
      )
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/cancel`
      )
      .set(auth(ids.customer));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "This order can no longer be cancelled"
    );
  });

  it("customer cannot cancel another customer's order", async () => {
    Order.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .put(
        `/api/orders/${ids.order}/cancel`
      )
      .set(auth(ids.otherCustomer));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Order not found"
    );
  });
});

/* =========================================================
   ADMIN API
========================================================= */

describe("Admin API", () => {
  it("SUPER_ADMIN can list all users", async () => {
    User.find.mockReturnValue(
      makeQuery([
        getUserById(ids.admin),
        getUserById(ids.vendor),
        getUserById(ids.customer),
      ])
    );

    const res = await request(app)
      .get("/api/admin/users")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(3);
  });

  it("admin user list supports role filtering", async () => {
    User.find.mockReturnValue(
      makeQuery([
        getUserById(ids.vendor),
      ])
    );

    const res = await request(app)
      .get("/api/admin/users?role=VENDOR")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);

    const filter =
      User.find.mock.calls[0][0];

    expect(filter.role).toBe("VENDOR");
  });

  it("admin user list supports search", async () => {
    User.find.mockReturnValue(
      makeQuery([])
    );

    const res = await request(app)
      .get("/api/admin/users?search=vendor")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);

    const filter =
      User.find.mock.calls[0][0];

    expect(filter.$or).toBeDefined();
    expect(filter.$or).toHaveLength(2);
  });

  it("customer cannot access admin users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set(auth(ids.customer));

    expect(res.status).toBe(403);
  });

  it("vendor cannot access admin users", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set(auth(ids.vendor));

    expect(res.status).toBe(403);
  });

  it("admin cannot delete nonexistent user", async () => {
    /*
     * Do NOT override User.findById here.
     *
     * protect() uses User.findById(adminId), and the default
     * implementation correctly returns the admin user.
     *
     * The controller then looks up ids.unknown and receives null.
     */
    const res = await request(app)
      .delete(`/api/admin/users/${ids.unknown}`)
      .set(auth(ids.admin));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "User not found"
    );
  });

  it("admin cannot delete SUPER_ADMIN", async () => {
    /*
     * The default User.findById implementation already maps
     * both the authenticated admin and the target admin ID.
     */
    const res = await request(app)
      .delete(`/api/admin/users/${ids.admin}`)
      .set(auth(ids.admin));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Super admin cannot be deleted"
    );
  });

  it("admin can delete customer without dependencies", async () => {
    const customer = getUserById(
      ids.customer
    );

    User.findByIdAndDelete.mockResolvedValue(
      customer
    );

    /*
     * Do NOT override User.findById.
     * The default mapping lets protect() authenticate the
     * admin and lets the controller find the customer.
     */

    const res = await request(app)
      .delete(
        `/api/admin/users/${ids.customer}`
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "User deleted successfully"
    );
  });

  it("admin cannot delete vendor with dependencies", async () => {
    /*
     * Keep User.findById at its default implementation so
     * authentication remains SUPER_ADMIN.
     */

    Store.countDocuments.mockResolvedValue(1);
    Product.countDocuments.mockResolvedValue(0);
    Order.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .delete(
        `/api/admin/users/${ids.vendor}`
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Vendor cannot be deleted"
    );
  });

  it("admin can delete vendor without dependencies", async () => {
    Store.countDocuments.mockResolvedValue(0);
    Product.countDocuments.mockResolvedValue(0);
    Order.countDocuments.mockResolvedValue(0);

    User.findByIdAndDelete.mockResolvedValue(
      getUserById(ids.vendor)
    );

    /*
     * Again, do not override User.findById.
     */

    const res = await request(app)
      .delete(
        `/api/admin/users/${ids.vendor}`
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "User deleted successfully"
    );
  });

  it("admin can list vendors with statistics", async () => {
    User.find.mockReturnValue(
      makeQuery([
        getUserById(ids.vendor),
      ])
    );

    Store.countDocuments.mockResolvedValue(2);
    Product.countDocuments.mockResolvedValue(5);
    Order.countDocuments.mockResolvedValue(7);

    Order.aggregate.mockResolvedValue([
      {
        _id: null,
        total: 12500,
      },
    ]);

    const res = await request(app)
      .get("/api/admin/vendors")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.vendors).toHaveLength(1);

    expect(res.body.vendors[0]).toEqual(
      expect.objectContaining({
        stores: 2,
        products: 5,
        orders: 7,
        revenue: 12500,
      })
    );
  });

  it("admin vendor list supports search", async () => {
    User.find.mockReturnValue(
      makeQuery([])
    );

    const res = await request(app)
      .get("/api/admin/vendors?search=vendor")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);

    const filter =
      User.find.mock.calls[0][0];

    expect(filter.role).toBe("VENDOR");
    expect(filter.$or).toBeDefined();
  });

  it("admin can suspend a vendor", async () => {
    const vendor = makeSavedDocument(
      getUserById(ids.vendor)
    );

    User.findOne.mockReturnValue(
      makeQuery(vendor)
    );

    const res = await request(app)
      .put(
        `/api/admin/vendors/${ids.vendor}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "SUSPENDED",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Vendor suspended successfully"
    );
    expect(vendor.status).toBe(
      "SUSPENDED"
    );
  });

  it("admin can activate a vendor", async () => {
    const vendor = makeSavedDocument(
      getUserById(ids.vendor)
    );

    vendor.status = "SUSPENDED";

    User.findOne.mockReturnValue(
      makeQuery(vendor)
    );

    const res = await request(app)
      .put(
        `/api/admin/vendors/${ids.vendor}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "ACTIVE",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Vendor activated successfully"
    );
    expect(vendor.status).toBe("ACTIVE");
  });

  it("rejects invalid vendor status", async () => {
    const res = await request(app)
      .put(
        `/api/admin/vendors/${ids.vendor}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "INVALID",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Invalid vendor status"
    );
  });

  it("returns 404 for nonexistent vendor", async () => {
    User.findOne.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .put(
        `/api/admin/vendors/${ids.unknown}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "ACTIVE",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Vendor not found"
    );
  });

  it("admin cannot delete vendor with stores", async () => {
    User.findOne.mockReturnValue(
      makeQuery(
        getUserById(ids.vendor)
      )
    );

    Store.countDocuments.mockResolvedValue(1);
    Product.countDocuments.mockResolvedValue(0);
    Order.countDocuments.mockResolvedValue(0);

    const res = await request(app)
      .delete(
        `/api/admin/vendors/${ids.vendor}`
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Vendor cannot be deleted"
    );
  });

  it("admin can delete vendor with no dependencies", async () => {
    User.findOne.mockReturnValue(
      makeQuery(
        getUserById(ids.vendor)
      )
    );

    Store.countDocuments.mockResolvedValue(0);
    Product.countDocuments.mockResolvedValue(0);
    Order.countDocuments.mockResolvedValue(0);

    User.findByIdAndDelete.mockResolvedValue(
      getUserById(ids.vendor)
    );

    const res = await request(app)
      .delete(
        `/api/admin/vendors/${ids.vendor}`
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Vendor deleted successfully"
    );
  });

  it("admin can list stores with statistics", async () => {
    Store.find.mockReturnValue(
      makeQuery([
        {
          ...store(),
          vendorId: {
            _id: ids.vendor,
            name: "Vendor One",
            email: "vendor@test.com",
          },
        },
      ])
    );

    Product.countDocuments.mockResolvedValue(4);
    Order.countDocuments.mockResolvedValue(6);

    Order.aggregate.mockResolvedValue([
      {
        _id: null,
        total: 15000,
      },
    ]);

    const res = await request(app)
      .get("/api/admin/stores")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.stores).toHaveLength(1);

    expect(res.body.stores[0]).toEqual(
      expect.objectContaining({
        products: 4,
        orders: 6,
        revenue: 15000,
      })
    );
  });

  it("admin store list supports search and status", async () => {
    Store.find.mockReturnValue(
      makeQuery([])
    );

    const res = await request(app)
      .get(
        "/api/admin/stores?search=nova&status=ACTIVE"
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(200);

    const filter =
      Store.find.mock.calls[0][0];

    expect(filter.status).toBe("ACTIVE");
    expect(filter.$or).toBeDefined();
  });

  it("admin can suspend a store", async () => {
    const existingStore = makeSavedDocument(
      store()
    );

    Store.findById.mockReturnValue(
      makeQuery(existingStore)
    );

    const res = await request(app)
      .put(
        `/api/admin/stores/${ids.store}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "SUSPENDED",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Store suspended successfully"
    );
    expect(existingStore.status).toBe(
      "SUSPENDED"
    );
  });

  it("admin can activate a store", async () => {
    const existingStore = makeSavedDocument(
      store({
        status: "SUSPENDED",
      })
    );

    Store.findById.mockReturnValue(
      makeQuery(existingStore)
    );

    const res = await request(app)
      .put(
        `/api/admin/stores/${ids.store}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "ACTIVE",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Store active successfully"
    );
    expect(existingStore.status).toBe(
      "ACTIVE"
    );
  });

  it("rejects invalid store status", async () => {
    const res = await request(app)
      .put(
        `/api/admin/stores/${ids.store}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "BROKEN",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Invalid store status"
    );
  });

  it("returns 404 for nonexistent admin store", async () => {
    Store.findById.mockReturnValue(
      makeQuery(null)
    );

    const res = await request(app)
      .put(
        `/api/admin/stores/${ids.unknown}/status`
      )
      .set(auth(ids.admin))
      .send({
        status: "ACTIVE",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(
      "Store not found"
    );
  });

  it("admin can list all orders", async () => {
    Order.find.mockReturnValue(
      makeQuery([order()])
    );

    const res = await request(app)
      .get("/api/admin/orders")
      .set(auth(ids.admin));

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });

  it("admin order list supports status filter", async () => {
    Order.find.mockReturnValue(
      makeQuery([])
    );

    const res = await request(app)
      .get(
        "/api/admin/orders?status=DELIVERED"
      )
      .set(auth(ids.admin));

    expect(res.status).toBe(200);

    const filter =
      Order.find.mock.calls[0][0];

    expect(filter.status).toBe(
      "DELIVERED"
    );
  });

  it("vendor cannot access admin orders", async () => {
    const res = await request(app)
      .get("/api/admin/orders")
      .set(auth(ids.vendor));

    expect(res.status).toBe(403);
  });

  it("customer cannot access admin stores", async () => {
    const res = await request(app)
      .get("/api/admin/stores")
      .set(auth(ids.customer));

    expect(res.status).toBe(403);
  });
});

/* =========================================================
   UNKNOWN ROUTE
========================================================= */

describe("Global error handling", () => {
  it("returns 404 for unknown API route", async () => {
    const res = await request(app)
      .get("/api/does-not-exist");

    expect(res.status).toBe(404);
  });
});
