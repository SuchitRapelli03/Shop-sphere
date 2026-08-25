import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

export async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required"
    });
  }

  const exists = await User.findOne({ email });

  if (exists) {
    return res.status(409).json({
      message: "Email already registered"
    });
  }

  // Public registration can only create CUSTOMER accounts.
  const safeRole = "CUSTOMER";

  const hashed = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: safeRole,
    status: "ACTIVE"
  });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    },
    token: signToken(user)
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  // Block suspended vendors from logging in.
  if (
    user.role === "VENDOR" &&
    user.status === "SUSPENDED"
  ) {
    return res.status(403).json({
      message:
        "Your vendor account has been suspended. Please contact the administrator."
    });
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    },
    token: signToken(user)
  });
}

export async function me(req, res) {
  res.json({
    user: req.user
  });
}