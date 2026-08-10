import { Router } from "express";
import {
  createProduct, listProducts, getProduct, updateProduct, deleteProduct
} from "../controllers/productController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", protect, allowRoles("VENDOR"), createProduct);
router.put("/:id", protect, allowRoles("VENDOR"), updateProduct);
router.delete("/:id", protect, allowRoles("VENDOR"), deleteProduct);

export default router;
