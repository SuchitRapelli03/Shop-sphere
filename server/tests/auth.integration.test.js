import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

process.env.JWT_SECRET = "test-secret";

vi.mock("razorpay", () => {
  return {
    default: class Razorpay {
      constructor() {}

      orders = {
        create: vi.fn(),
        fetch: vi.fn(),
      };
    },
  };
});

vi.mock("../src/models/User.js", () => {
  const User = {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  };

  return {
    default: User,
  };
});

vi.mock("../src/utils/email.js", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(),
}));

const { default: app } = await import("../src/app.js");

const { default: User } = await import("../src/models/User.js");

describe("Authentication API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/health returns API health", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.service).toBe("shop-sphere-api");
  });

  it("POST /api/auth/register creates a customer", async () => {
    User.findOne.mockResolvedValue(null);

    User.create.mockResolvedValue({
      _id: "customer123",
      name: "Test Customer",
      email: "customer@test.com",
      role: "CUSTOMER",
      status: "ACTIVE",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Customer",
        email: "customer@test.com",
        password: "password123",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.name).toBe("Test Customer");
    expect(response.body.user.email).toBe("customer@test.com");
    expect(response.body.user.role).toBe("CUSTOMER");
    expect(response.body.token).toBeDefined();
  });

  it("POST /api/auth/register creates a vendor", async () => {
    User.findOne.mockResolvedValue(null);

    User.create.mockResolvedValue({
      _id: "vendor123",
      name: "Test Vendor",
      email: "vendor@test.com",
      role: "VENDOR",
      status: "ACTIVE",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Vendor",
        email: "vendor@test.com",
        password: "password123",
        role: "VENDOR",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe("VENDOR");
    expect(response.body.token).toBeDefined();
  });

  it("does not allow SUPER_ADMIN registration", async () => {
    User.findOne.mockResolvedValue(null);

    User.create.mockResolvedValue({
      _id: "user123",
      name: "Admin Attempt",
      email: "admin@test.com",
      role: "CUSTOMER",
      status: "ACTIVE",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin Attempt",
        email: "admin@test.com",
        password: "password123",
        role: "SUPER_ADMIN",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe("CUSTOMER");
  });

  it("rejects registration when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Incomplete User",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Name, email and password are required"
    );
  });

  it("rejects duplicate email registration", async () => {
    User.findOne.mockResolvedValue({
      _id: "existing123",
      email: "existing@test.com",
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Existing User",
        email: "existing@test.com",
        password: "password123",
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      "Email already registered"
    );
  });

  it("logs in with valid credentials", async () => {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(
      "password123",
      10
    );

    User.findOne.mockResolvedValue({
      _id: "customer123",
      name: "Test Customer",
      email: "customer@test.com",
      password: hashedPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer@test.com",
        password: "password123",
      });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(
      "customer@test.com"
    );
    expect(response.body.user.role).toBe("CUSTOMER");
    expect(response.body.token).toBeDefined();
  });

  it("rejects invalid credentials", async () => {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(
      "correct-password",
      10
    );

    User.findOne.mockResolvedValue({
      _id: "customer123",
      name: "Test Customer",
      email: "customer@test.com",
      password: hashedPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer@test.com",
        password: "wrong-password",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password"
    );
  });

  it("rejects login for non-existing user", async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "missing@test.com",
        password: "password123",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password"
    );
  });

  it("rejects suspended vendor login", async () => {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(
      "password123",
      10
    );

    User.findOne.mockResolvedValue({
      _id: "vendor123",
      name: "Suspended Vendor",
      email: "vendor@test.com",
      password: hashedPassword,
      role: "VENDOR",
      status: "SUSPENDED",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "vendor@test.com",
        password: "password123",
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain(
      "suspended"
    );
  });

  it("rejects /me without authentication", async () => {
    const response = await request(app)
      .get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication required"
    );
  });

  it("rejects /me with an invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set(
        "Authorization",
        "Bearer invalid-token"
      );

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Invalid or expired token"
    );
  });

  it("returns the authenticated user from /me", async () => {
    const jwt = await import("jsonwebtoken");

    const token = jwt.sign(
      {
        userId: "customer123",
        role: "CUSTOMER",
      },
      "test-secret"
    );

    const mockSelect = vi.fn().mockResolvedValue({
      _id: "customer123",
      name: "Test Customer",
      email: "customer@test.com",
      role: "CUSTOMER",
      status: "ACTIVE",
    });

    User.findById.mockReturnValue({
      select: mockSelect,
    });

    const response = await request(app)
      .get("/api/auth/me")
      .set(
        "Authorization",
        `Bearer ${token}`
      );

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(
      "customer@test.com"
    );
    expect(response.body.user.role).toBe("CUSTOMER");
  });
});