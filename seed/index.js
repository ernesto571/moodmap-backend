import { ENTRIES } from "./entries.js";
import { sql } from "../config/db.js";

async function seedEntries() {
  console.log("🌱 Starting entries seed...");

  for (const entry of ENTRIES) {
    try {
      await sql`
        INSERT INTO entries (user_id, mood, energy, note, score, created_at)
        VALUES (${entry.user_id}, ${entry.mood}, ${entry.energy}, ${entry.note}, ${entry.score}, ${entry.created_at})
      `;
      console.log(`✅ Entry seeded: ${entry.mood} on ${entry.created_at}`);
    } catch (error) {
      console.error(`❌ Failed to seed entry (${entry.created_at}):`, error.message);
    }
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seedEntries();