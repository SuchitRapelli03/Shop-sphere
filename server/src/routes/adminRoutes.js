// server/src/routes/adminRoutes.js

import { Router } from "express";

import {
  getAllUsers,
  deleteUser,
  getAllVendors,
  updateVendorStatus,
  deleteVendor,
  getAllStores,
  updateStoreStatus,
  getAllOrders
} from "../controllers/adminController.js";

import {
  protect,
  allowRoles
} from "../middleware/auth.js";

const router = Router();

/* =========================
   USER MANAGEMENT
========================= */

router.get(
  "/users",
  protect,
  allowRoles("SUPER_ADMIN"),
  getAllUsers
);

router.delete(
  "/users/:id",
  protect,
  allowRoles("SUPER_ADMIN"),
  deleteUser
);

/* =========================
   VENDOR MANAGEMENT
========================= */

router.get(
  "/vendors",
  protect,
  allowRoles("SUPER_ADMIN"),
  getAllVendors
);

router.put(
  "/vendors/:id/status",
  protect,
  allowRoles("SUPER_ADMIN"),
  updateVendorStatus
);

router.delete(
  "/vendors/:id",
  protect,
  allowRoles("SUPER_ADMIN"),
  deleteVendor
);

/* =========================
   STORE MANAGEMENT
========================= */

router.get(
  "/stores",
  protect,
  allowRoles("SUPER_ADMIN"),
  getAllStores
);

router.put(
  "/stores/:id/status",
  protect,
  allowRoles("SUPER_ADMIN"),
  updateStoreStatus
);

/* =========================
   ORDER MANAGEMENT
========================= */

router.get(
  "/orders",
  protect,
  allowRoles("SUPER_ADMIN"),
  getAllOrders
);

export default router;