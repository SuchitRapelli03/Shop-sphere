import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import mongoose from "mongoose";

/* =========================================================
   TEST ENVIRONMENT
========================================================= */

process.env.RAZORPAY_KEY_ID = "test_razorpay_key";
process.env.RAZORPAY_KEY_SECRET = "test_razorpay_secret";

/* =========================================================
   MOCKS
========================================================= */

const razorpayMock = vi.hoisted(() => ({
  orders: {
    create: vi.fn(),
    fetch: vi.fn(),
  },
}));

vi.mock("razorpay", () => {
  return {
    default: class Razorpay {
      constructor() {
        return razorpayMock;
      }
    },
  };
});

const cartMock = vi.hoisted(() => ({
  findOne: vi.fn(),
}));

vi.mock("../src/models/Cart.js", () => ({
  default: cartMock,
}));

const orderMock = vi.hoisted(() => ({
  find: vi.fn(),
}));

vi.mock("../src/models/Order.js", () => ({
  default: orderMock,
}));

const stripeMock = vi.hoisted(() => ({
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
}));

vi.mock("../src/utils/stripe.js", () => ({
  default: stripeMock,
}));

const orderServiceMock = vi.hoisted(() => ({
  validateCart: vi.fn(),
  validateBuyNowItem: vi.fn(),
  createOrdersFromCart: vi.fn(),
  createOrderFromBuyNow: vi.fn(),
}));

vi.mock("../src/services/orderService.js", () => orderServiceMock);

/* =========================================================
   IMPORT CONTROLLER AFTER MOCKS
========================================================= */

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../src/controllers/paymentController.js";

/* =========================================================
   HELPERS
========================================================= */

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
}

function createRequest(overrides = {}) {
  return {
    user: {
      _id: new mongoose.Types.ObjectId(),
      email: "customer@example.com",
    },

    body: {},

    headers: {},

    ...overrides,
  };
}

function generateSignature(orderId, paymentId) {
  return crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/* =========================================================
   TESTS
========================================================= */

describe("createRazorpayOrder()", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    razorpayMock.orders.create.mockResolvedValue({
      id: "order_test_123",
      amount: 49900,
      currency: "INR",
    });

    orderServiceMock.validateCart.mockResolvedValue({
      total: 499,
      storeGroups: [],
    });

    orderServiceMock.validateBuyNowItem.mockResolvedValue({
      total: 799,
      items: [],
    });
  });

  /* =======================================================
     CART
  ======================================================= */

  it("creates a Razorpay order for CART checkout", async () => {
    const req = createRequest({
      body: {
        checkoutType: "CART",
      },
    });

    const res = createResponse();

    await createRazorpayOrder(req, res);

    expect(
      orderServiceMock.validateCart
    ).toHaveBeenCalledWith(req.user._id);

    expect(
      razorpayMock.orders.create
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 49900,
        currency: "INR",
        notes: expect.objectContaining({
          checkoutType: "CART",
        }),
      })
    );

    expect(res.json).toHaveBeenCalledWith({
      razorpayOrderId: "order_test_123",
      amount: 49900,
      currency: "INR",
      keyId: "test_razorpay_key",
    });
  });

  /* =======================================================
     BUY NOW
  ======================================================= */

  it("creates a Razorpay order for BUY_NOW checkout", async () => {
    const productId =
      new mongoose.Types.ObjectId();

    const variantId =
      new mongoose.Types.ObjectId();

    const req = createRequest({
      body: {
        checkoutType: "BUY_NOW",
        productId,
        variantId,
        quantity: 2,
      },
    });

    const res = createResponse();

    await createRazorpayOrder(req, res);

    expect(
      orderServiceMock.validateBuyNowItem
    ).toHaveBeenCalledWith(
      req.user._id,
      productId,
      2,
      variantId
    );

    expect(
      razorpayMock.orders.create
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 79900,
        currency: "INR",
        notes: {
          checkoutType: "BUY_NOW",
          productId: productId.toString(),
          variantId: variantId.toString(),
          quantity: "2",
        },
      })
    );

    expect(res.json).toHaveBeenCalledWith({
      razorpayOrderId: "order_test_123",
      amount: 49900,
      currency: "INR",
      keyId: "test_razorpay_key",
    });
  });

  /* =======================================================
     VALIDATION ERROR
  ======================================================= */

  it("returns 400 when CART validation fails", async () => {
    orderServiceMock.validateCart.mockRejectedValue(
      new Error("Cart is empty")
    );

    const req = createRequest({
      body: {
        checkoutType: "CART",
      },
    });

    const res = createResponse();

    await createRazorpayOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Cart is empty",
    });

    expect(
      razorpayMock.orders.create
    ).not.toHaveBeenCalled();
  });
});


/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

describe("verifyRazorpayPayment()", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    orderMock.find.mockResolvedValue([]);

    razorpayMock.orders.fetch.mockResolvedValue({
      id: "order_test_123",
      amount: 49900,
      currency: "INR",
      notes: {
        checkoutType: "CART",
      },
    });

    orderServiceMock.validateCart.mockResolvedValue({
      total: 499,
      storeGroups: [],
    });

    orderServiceMock.validateBuyNowItem.mockResolvedValue({
      total: 799,
      items: [],
    });

    orderServiceMock.createOrdersFromCart.mockResolvedValue({
      orders: [
        {
          _id: new mongoose.Types.ObjectId(),
          storeId: new mongoose.Types.ObjectId(),
          total: 499,
        },
      ],
      total: 499,
    });

    orderServiceMock.createOrderFromBuyNow.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      total: 799,
    });
  });

  /* =======================================================
     MISSING PAYMENT DETAILS
  ======================================================= */

  it("rejects missing Razorpay payment details", async () => {
    const req = createRequest({
      body: {},
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Missing Razorpay payment details",
    });
  });

  /* =======================================================
     SHIPPING ADDRESS
  ======================================================= */

  it("rejects incomplete shipping address", async () => {
    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Complete shipping address is required",
    });
  });

  /* =======================================================
     INVALID SIGNATURE
  ======================================================= */

  it("rejects an invalid Razorpay signature", async () => {
    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: "invalid_signature",
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid payment signature",
    });

    expect(
      razorpayMock.orders.fetch
    ).not.toHaveBeenCalled();
  });

  /* =======================================================
     DUPLICATE PAYMENT
  ======================================================= */

  it("returns existing orders for an already verified payment", async () => {
    const existingOrders = [
      {
        _id: new mongoose.Types.ObjectId(),
        razorpayPaymentId: "pay_test_123",
        total: 499,
      },
    ];

    orderMock.find.mockResolvedValue(
      existingOrders
    );

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Payment already verified",
      orders: existingOrders,
    });

    expect(
      razorpayMock.orders.fetch
    ).not.toHaveBeenCalled();

    expect(
      orderServiceMock.createOrdersFromCart
    ).not.toHaveBeenCalled();
  });

  /* =======================================================
     RAZORPAY ORDER NOT FOUND
  ======================================================= */

  it("rejects when the Razorpay order cannot be found", async () => {
    razorpayMock.orders.fetch.mockResolvedValue(
      null
    );

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Razorpay order not found",
    });
  });

  /* =======================================================
     INVALID CURRENCY
  ======================================================= */

  it("rejects a Razorpay order with invalid currency", async () => {
    razorpayMock.orders.fetch.mockResolvedValue({
      id: "order_test_123",
      amount: 49900,
      currency: "USD",
      notes: {
        checkoutType: "CART",
      },
    });

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Invalid payment currency.",
    });

    expect(
      orderServiceMock.validateCart
    ).not.toHaveBeenCalled();
  });

  /* =======================================================
     CART AMOUNT MISMATCH
  ======================================================= */

  it("rejects when Razorpay amount does not match cart total", async () => {
    razorpayMock.orders.fetch.mockResolvedValue({
      id: "order_test_123",
      amount: 99900,
      currency: "INR",
      notes: {
        checkoutType: "CART",
      },
    });

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Payment amount does not match the order total.",
    });

    expect(
      orderServiceMock.createOrdersFromCart
    ).not.toHaveBeenCalled();
  });

  /* =======================================================
     SUCCESSFUL CART PAYMENT
  ======================================================= */

  it("verifies CART payment and creates multiple store orders", async () => {
    const orders = [
      {
        _id: new mongoose.Types.ObjectId(),
        storeId: new mongoose.Types.ObjectId(),
        total: 200,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        storeId: new mongoose.Types.ObjectId(),
        total: 299,
      },
    ];

    orderServiceMock.createOrdersFromCart.mockResolvedValue({
      orders,
      total: 499,
    });

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(
      orderServiceMock.validateCart
    ).toHaveBeenCalledWith(req.user._id);

    expect(
      orderServiceMock.createOrdersFromCart
    ).toHaveBeenCalledWith({
      customerId: req.user._id,
      shippingAddress:
        req.body.shippingAddress,
      paymentStatus: "PAID",
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
    });

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Payment verified and orders created successfully",
      orders,
      total: 499,
      order: orders[0],
    });
  });

  /* =======================================================
     BUY NOW INCOMPLETE NOTES
  ======================================================= */

  it("rejects BUY_NOW when Razorpay notes are incomplete", async () => {
    razorpayMock.orders.fetch.mockResolvedValue({
      id: "order_test_123",
      amount: 79900,
      currency: "INR",
      notes: {
        checkoutType: "BUY_NOW",
      },
    });

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Razorpay Buy Now order information is incomplete.",
    });
  });

  /* =======================================================
     SUCCESSFUL BUY NOW
  ======================================================= */

  it("verifies BUY_NOW payment and creates one order", async () => {
    const productId =
      new mongoose.Types.ObjectId();

    const variantId =
      new mongoose.Types.ObjectId();

    const order = {
      _id: new mongoose.Types.ObjectId(),
      productId,
      variantId,
      total: 799,
      paymentStatus: "PAID",
    };

    razorpayMock.orders.fetch.mockResolvedValue({
      id: "order_test_123",
      amount: 79900,
      currency: "INR",
      notes: {
        checkoutType: "BUY_NOW",
        productId: productId.toString(),
        variantId: variantId.toString(),
        quantity: "2",
      },
    });

    orderServiceMock.validateBuyNowItem.mockResolvedValue({
      total: 799,
      items: [],
    });

    orderServiceMock.createOrderFromBuyNow.mockResolvedValue(
      order
    );

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(
      orderServiceMock.validateBuyNowItem
    ).toHaveBeenCalledWith(
      req.user._id,
      productId.toString(),
      2,
      variantId.toString()
    );

    expect(
      orderServiceMock.createOrderFromBuyNow
    ).toHaveBeenCalledWith({
      customerId: req.user._id,
      productId: productId.toString(),
      variantId: variantId.toString(),
      quantity: 2,
      shippingAddress:
        req.body.shippingAddress,
      paymentStatus: "PAID",
      razorpayOrderId: "order_test_123",
      razorpayPaymentId: "pay_test_123",
    });

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Payment verified and order created successfully",
      order,
      orders: [order],
    });
  });

  /* =======================================================
     SERVICE FAILURE
  ======================================================= */

  it("returns 400 when order creation fails after payment verification", async () => {
    orderServiceMock.createOrdersFromCart.mockRejectedValue(
      new Error("Insufficient stock for Product A")
    );

    const req = createRequest({
      body: {
        razorpay_order_id: "order_test_123",
        razorpay_payment_id: "pay_test_123",
        razorpay_signature: generateSignature(
          "order_test_123",
          "pay_test_123"
        ),
        shippingAddress: {
          fullName: "Test Customer",
          phone: "9999999999",
          addressLine: "123 Test Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      },
    });

    const res = createResponse();

    await verifyRazorpayPayment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message:
        "Insufficient stock for Product A",
    });
  });
});
