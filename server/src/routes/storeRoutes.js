import { Router } from "express";

import {
  createStore,
  listStores,
  listVendorStores,
  getStoreBySlug,
  updateStore,
  deleteStore,
} from "../controllers/storeController.js";

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
  listStores
);

router.get(
  "/slug/:slug",
  getStoreBySlug
);

/* =========================
   VENDOR
========================= */

router.get(
  "/vendor",
  protect,
  allowRoles("VENDOR"),
  listVendorStores
);

router.post(
  "/",
  protect,
  allowRoles("VENDOR"),
  createStore
);

router.put(
  "/:id",
  protect,
  allowRoles("VENDOR"),
  updateStore
);

router.delete(
  "/:id",
  protect,
  allowRoles("VENDOR"),
  deleteStore
);

export default router;