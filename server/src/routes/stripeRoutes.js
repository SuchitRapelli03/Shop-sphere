import { Router } from "express";
import {
  createStripeCheckoutSession
} from "../controllers/stripeController.js";
import {
  protect,
  allowRoles
} from "../middleware/auth.js";

const router = Router();

router.post(
  "/create-checkout-session",
  protect,
  allowRoles("CUSTOMER"),
  createStripeCheckoutSession
);

export default router;