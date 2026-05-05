// weeklyReport.job.js
import { sql } from "../config/db.js";
import { geminiModel } from "../config/gemini.config.js";
import { buildWeeklyReportPrompt } from "../lib/analyze.lib.js";
import getUserFromClerk from "../lib/getUserFromClerk.js";

export const generateWeeklyReports = async () => {
    const users = await sql`SELECT id FROM users`;

    for (const user of users) {
        const user_id = user.id;
        

        const today = new Date();
        const day = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) - 7);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const entries = await sql`
            SELECT * FROM entries
            WHERE user_id = ${user_id}
            AND created_at >= ${monday.toISOString()}
            AND created_at <= ${sunday.toISOString()}
            ORDER BY created_at ASC
        `;

        if (entries.length === 0) {
            console.log(`⏭️ No entries for user ${user_id}, skipping`);
            continue;
        }
        
        console.log("🤖 Sending to Gemini...");

        const prompt = buildWeeklyReportPrompt(entries, monday, sunday);
        const result = await geminiModel.generateContent(prompt);
        const rawText = result.response.text();
        const cleaned = rawText.replace(/```json|```/g, "").trim();

        let report;
        try {
            report = JSON.parse(cleaned);
            console.log("Response from gemini", report)
        } catch (e) {
            console.error(`❌ JSON parse failed for user ${user_id}:`, e.message);
            continue;
        }

        await sql`
            INSERT INTO reports (
                user_id, week_start, week_range, total_entries, avg_score, best_day, worst_day,
                pattern_summary, daily_breakdown, good_day_triggers, bad_day_triggers, key_insight
            )
            VALUES (
                ${user_id}, ${monday.toISOString()}, ${report.week_range}, ${report.total_entries}, ${report.avg_score},
                ${JSON.stringify(report.best_day)}, ${JSON.stringify(report.worst_day)},
                ${report.pattern_summary}, ${JSON.stringify(report.daily_breakdown)},
                ${report.good_day_triggers}, ${report.bad_day_triggers}, ${report.key_insight}
            )
            ON CONFLICT (user_id, week_start) DO NOTHING
        `;
        console.log(`✅ Report saved for user ${user_id}`);
    }
};

export const getReports = async (req, res) => {
    try {
        const { user_id } = await getUserFromClerk(req)
        
        const reports = await sql`
            SELECT * FROM reports
            WHERE user_id = ${user_id}
            ORDER BY created_at DESC
        `;
        return res.status(200).json({ reports });
    } catch (error) {
        console.error("Fetch Reports error:", error);
        return res.status(500).json({ message: "Failed to fetch reports." });
    }
}