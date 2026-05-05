import { clerkClient } from "@clerk/express";
import { sql } from "../config/db.js";

export const createProfile = async (req, res) => {
  console.log("📝 createProfile: Starting...");
  try {
    const { userId: clerkUserId } = req.auth(); // ✅ call as function
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || null;
    const firstName = clerkUser.firstName || null;
    const lastName = clerkUser.lastName || null;
    const lastLogin = clerkUser.lastSignInAt
      ? new Date(Number(clerkUser.lastSignInAt))
      : null;

    const result = await sql`
      INSERT INTO users (clerk_id, email, first_name, last_name, last_login)
      VALUES (${clerkUserId}, ${email}, ${firstName}, ${lastName},  ${lastLogin})
      ON CONFLICT (clerk_id)
      DO UPDATE SET last_login = EXCLUDED.last_login
      RETURNING *
    `;
    console.log("✅ User Profile created/found:", result[0]);
    res.json({
      message: "User profile ready",
      profile: result[0],
    });
  } catch (err) {
    console.error("❌ createrProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  console.log("🔍 getUserProfile: Starting...");
  try {
    const { userId: clerkUserId } = req.auth(); // ✅ call as function
    const result = await sql`
      SELECT * FROM users
      WHERE clerk_id = ${clerkUserId}
      LIMIT 1
    `;
    if (!result[0]) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error("❌ getUserProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};