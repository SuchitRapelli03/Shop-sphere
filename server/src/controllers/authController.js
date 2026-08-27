import bcrypt from "bcryptjs";

import User from "../models/User.js";

import { signToken } from "../utils/token.js";

export async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required"
      });
    }

    /* =========================
       VALIDATE ROLE
       
       Public registration can
       ONLY create CUSTOMER or
       VENDOR accounts.

       SUPER_ADMIN can never be
       created through registration.
    ========================= */

    const selectedRole =
      role === "VENDOR"
        ? "VENDOR"
        : "CUSTOMER";


    /* =========================
       CHECK EMAIL
    ========================= */

    const exists =
      await User.findOne({
        email: email.toLowerCase().trim()
      });

    if (exists) {
      return res.status(409).json({
        message:
          "Email already registered"
      });
    }


    /* =========================
       HASH PASSWORD
    ========================= */

    const hashed =
      await bcrypt.hash(
        password,
        12
      );


    /* =========================
       CREATE USER
    ========================= */

    const user =
      await User.create({

        name: name.trim(),

        email:
          email.toLowerCase().trim(),

        password: hashed,

        role: selectedRole,

        status: "ACTIVE"

      });


    /* =========================
       RESPONSE
    ========================= */

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

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Registration failed"
    });
  }
}


/* =========================
   LOGIN
========================= */

export async function login(req, res) {

  try {

    const {
      email,
      password
    } = req.body;


    const user =
      await User.findOne({
        email:
          email.toLowerCase().trim()
      });


    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password
      ))
    ) {

      return res.status(401).json({
        message:
          "Invalid email or password"
      });

    }


    /* =========================
       BLOCK SUSPENDED VENDORS
    ========================= */

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

      token:
        signToken(user)

    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Login failed"
    });

  }
}


/* =========================
   CURRENT USER
========================= */

export async function me(req, res) {

  res.json({
    user: req.user
  });

}