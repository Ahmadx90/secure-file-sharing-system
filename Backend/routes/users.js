import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getProfile, updateProfile } from "../controllers/users.js";

const router = express.Router();

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

export default router;
