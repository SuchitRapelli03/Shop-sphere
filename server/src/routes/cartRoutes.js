import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.use(protect, allowRoles("CUSTOMER"));
router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);

export default router;
