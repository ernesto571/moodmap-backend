// middleware/auth.middleware.js
import { sql } from "../config/db.js";

export const requireLogin = (req, res, next) => {
  const auth = req.auth();
  console.log("🔐 Auth check:", {
    hasAuth: !!auth,
    userId: auth?.userId || "none"
  });
  if (!auth?.userId) {
    console.log("❌ Authentication failed: No userId");
    return res.status(401).json({ error: "Not authenticated" });
  }
  console.log("✅ Authentication passed for user:", auth.userId);
  req.authData = auth;
  next();
};
