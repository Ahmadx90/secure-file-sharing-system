import { verifyToken } from "../config/firebase.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    res
      .status(401)
      .json({ success: false, error: "Invalid token", message: error.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = await verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    console.error("❌ Optional auth error:", error.message);
    next(); // Continue without user
  }
};
