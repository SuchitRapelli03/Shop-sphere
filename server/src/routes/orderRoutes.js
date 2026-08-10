import { Router } from "express";
import {
  createOrder, myOrders, vendorOrders, updateOrderStatus
} from "../controllers/orderController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, allowRoles("CUSTOMER"), createOrder);
router.get("/my", protect, allowRoles("CUSTOMER"), myOrders);
router.get("/vendor", protect, allowRoles("VENDOR"), vendorOrders);
router.put("/:id/status", protect, allowRoles("VENDOR"), updateOrderStatus);

export default router;
