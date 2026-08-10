import { Router } from "express";
import {
  createStore, listStores, getStoreBySlug, updateStore, deleteStore
} from "../controllers/storeController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", listStores);
router.get("/slug/:slug", getStoreBySlug);
router.post("/", protect, allowRoles("VENDOR"), createStore);
router.put("/:id", protect, allowRoles("VENDOR"), updateStore);
router.delete("/:id", protect, allowRoles("VENDOR"), deleteStore);

export default router;
