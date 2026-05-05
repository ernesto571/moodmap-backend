import { sql } from "../config/db.js";
import { clerkClient } from "@clerk/express";

// Helper function to get user info from Clerk and database
const getUserFromClerk = async (req) => {
  try {
    // ✅ handle both req.auth() function and req.auth object
    const auth = typeof req.auth === "function" ? req.auth() : req.auth;
    const clerkUserId = auth?.userId;
    
    console.log("🔍 clerkUserId:", clerkUserId);

    if (!clerkUserId) {
      return { user_id: null, user_first_name: "guest", user_last_name: "" };
    }

    const clerkUser = await clerkClient.users.getUser(clerkUserId);
   
    const dbUser = await sql`
      SELECT id, first_name, last_name FROM users WHERE clerk_id = ${clerkUserId} LIMIT 1
    `;
    
    console.log("🔍 dbUser result:", dbUser);

    if (dbUser.length === 0) {
      console.log("❌ User not found in DB for clerk_id:", clerkUserId);
      return {
        user_id: null,
        user_first_name: clerkUser.firstName || "guest",
        user_last_name: clerkUser.lastName || ""
      };
    }

    return {
      user_id: dbUser[0].id,
      user_first_name: dbUser[0].first_name || "guest",
      user_last_name: dbUser[0].last_name || ""
    };
  } catch (error) {
    console.error("Error fetching user from Clerk:", error);
    return { user_id: null, user_first_name: "guest", user_last_name: "" };
  }
};

export default getUserFromClerk