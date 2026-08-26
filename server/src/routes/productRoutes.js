import { Router } from "express";

import {
  createProduct,
  listProducts,
  listVendorProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  protect,
  allowRoles,
} from "../middleware/auth.js";

const router = Router();

/* =========================
   PUBLIC
========================= */

router.get(
  "/",
  listProducts
);

/* =========================
   VENDOR
========================= */

router.get(
  "/vendor",
  protect,
  allowRoles("VENDOR"),
  listVendorProducts
);

/* =========================
   PRODUCT BY ID
========================= */

router.get(
  "/:id",
  getProduct
);

/* =========================
   VENDOR MANAGEMENT
========================= */

router.post(
  "/",
  protect,
  allowRoles("VENDOR"),
  createProduct
);

router.put(
  "/:id",
  protect,
  allowRoles("VENDOR"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  allowRoles("VENDOR"),
  deleteProduct
);

export default router;