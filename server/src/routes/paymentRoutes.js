import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeCheckout
} from "../controllers/paymentController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

router.post(
  "/create-razorpay-order",
  protect,
  allowRoles("CUSTOMER"),
  createRazorpayOrder
);

router.post(
  "/create-stripe-checkout",
  protect,
  allowRoles("CUSTOMER"),
  createStripeCheckout
);

router.post(
  "/verify",
  protect,
  allowRoles("CUSTOMER"),
  verifyRazorpayPayment
);

export default router;