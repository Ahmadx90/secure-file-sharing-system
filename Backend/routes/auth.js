// Backend/routes/auth.js

import express from "express";
import { signup, login, googleAuth, verifyToken } from "../controllers/auth.js";
import { getProfile } from "../controllers/users.js";
import { authenticateToken } from "../middleware/auth.js"; // ✅ Add middleware import

// ✅ Initialize router first
const router = express.Router();

// ✅ Define routes AFTER router is initialized
router.get("/profile", authenticateToken, getProfile);

router.post("/register", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/verify", verifyToken);

export default router;
