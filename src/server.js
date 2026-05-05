import { sql } from "../config/db.js";
import app from "./app.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

async function initDB(){
    console.log("🔄 Initializing database...");
    try {
         // users table
         await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                clerk_id VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `;
        console.log("✅ Users table created/verified");

        // entries table
        await sql`
            CREATE TABLE IF NOT EXISTS entries (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                note VARCHAR(500),
                mood TEXT,
                energy INTEGER,
                score NUMERIC(3,1),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log("✅ Entries table created/verified");

        // one entry per day constraint
        await sql`
            CREATE UNIQUE INDEX IF NOT EXISTS one_entry_per_day
            ON entries (user_id, (created_at::date))
        `;
        console.log("✅ Daily entry constraint set");

        // reports table
        await sql`
            CREATE TABLE IF NOT EXISTS reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                week_start DATE,
                week_range TEXT NOT NULL,
                total_entries INTEGER NOT NULL ,
                avg_score NUMERIC(3,1),
                best_day JSONB DEFAULT '{}',
                worst_day JSONB DEFAULT '{}',
                pattern_summary TEXT NOT NULL,
                daily_breakdown JSONB DEFAULT '[]',
                good_day_triggers TEXT[] DEFAULT '{}',
                bad_day_triggers TEXT[] DEFAULT '{}',
                key_insight TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, week_start)
            )
        `;
        console.log("✅ Reports table created/verified");

    } catch (error) {
        console.error("❌ Error initDB:", error);
        process.exit(1);
    }
}

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});