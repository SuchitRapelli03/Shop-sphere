import { Router } from "express";
import { vendorAnalytics, adminAnalytics } from "../controllers/analyticsController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.get("/vendor", protect, allowRoles("VENDOR"), vendorAnalytics);
router.get("/admin", protect, allowRoles("SUPER_ADMIN"), adminAnalytics);

export default router;
