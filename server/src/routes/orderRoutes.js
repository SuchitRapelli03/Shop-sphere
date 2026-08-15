import { Router } from "express";
import {
  createOrder,
  myOrders,
  vendorOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  protect,
  allowRoles("CUSTOMER"),
  createOrder
);

router.get(
  "/my",
  protect,
  allowRoles("CUSTOMER"),
  myOrders
);

router.get(
  "/vendor",
  protect,
  allowRoles("VENDOR"),
  vendorOrders
);

router.put(
  "/:id/status",
  protect,
  allowRoles("VENDOR"),
  updateOrderStatus
);

// Customer cancellation
router.put(
  "/:id/cancel",
  protect,
  allowRoles("CUSTOMER"),
  cancelOrder
);

export default router;