import { Router } from "express";
import { createCheckoutSession } from "../controllers/paymentController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.post("/create-checkout-session", protect, allowRoles("CUSTOMER"), createCheckoutSession);

export default router;
