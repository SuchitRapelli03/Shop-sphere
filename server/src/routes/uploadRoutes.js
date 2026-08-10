import { Router } from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();
router.post("/image", protect, allowRoles("VENDOR"), uploadImage);

export default router;
