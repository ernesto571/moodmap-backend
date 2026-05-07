import { sql } from "../config/db.js";
import getUserFromClerk from "../lib/getUserFromClerk.js"

export const addEntry = async(req, res) => {
    try {
        const { user_id } = await getUserFromClerk(req)
        const { note, mood, energy } = req.body

        // ✅ inside the function, after user_id is available
        const today = new Date().toLocaleDateString("en-CA");
        const existing = await sql`
            SELECT id FROM entries
            WHERE user_id = ${user_id}
            AND created_at >= ${today}::date
            AND created_at < (${today}::date + INTERVAL '1 day')
            LIMIT 1
        `;
        if (existing.length > 0) {
            return res.status(409).json({ message: "You've already checked in today" });
        }

        console.log("📁 Entry received:", { note, mood, energy });
        let mood_score
        if (mood === "Low") mood_score = 2;
        else if (mood === "Meh") mood_score = 4;
        else if (mood === "Good") mood_score = 6;
        else if (mood === "Great") mood_score = 8;
        else mood_score = 10;
        let energy_score
        if (energy === 1) energy_score = -1;
        else if (energy === 2) energy_score = -0.5;
        else if (energy === 3) energy_score = 0;
        else if (energy === 4) energy_score = 0.5;
        else energy_score = 1;

        
        const final_score = Math.min(mood_score + energy_score, 10);
        
        const [entry] = await sql`
            INSERT INTO entries (user_id, note, mood, energy, score)
            VALUES (${user_id}, ${note}, ${mood}, ${energy}, ${final_score})
            RETURNING id, note, score
        `;
        return res.status(201).json({ message: "Entry Saved", entry });
    } catch (error) {
        console.error("addEntry error:", { message: error.message, stack: error.stack });
        return res.status(500).json({ message: error.message || "addEntry failed" }); 
    }
}

export const editEntry = async (req, res) => {
    try {
        const {id} = req.params
        const { user_id } = await getUserFromClerk(req)
        const { note, mood, energy } = req.body

        let mood_score
        if (mood === "Low") mood_score = 2;
        else if (mood === "Meh") mood_score = 4;
        else if (mood === "Good") mood_score = 6;
        else if (mood === "Great") mood_score = 8;
        else mood_score = 10;
        let energy_score
        if (energy === 1) energy_score = -1;
        else if (energy === 2) energy_score = -0.5;
        else if (energy === 3) energy_score = 0;
        else if (energy === 4) energy_score = 0.5;
        else energy_score = 1;

        const final_score = Math.min(mood_score + energy_score, 10);

        const existing = await sql`
            SELECT * FROM entries WHERE id = ${id} AND user_id = ${user_id}
        `;

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Entry not found or unauthorized" });
        }

        const updatedEntry = await sql`
            UPDATE entries SET
                note = COALESCE(${note}, note),
                mood = COALESCE(${mood}, mood),
                energy = COALESCE(${energy}, energy),
                score = COALESCE(${final_score}, score),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id} AND user_id = ${user_id}
            RETURNING *
        `;

        res.status(200).json({ message: "Emtry Updated", data: updatedEntry[0] });

    } catch (error) {
        console.log("Error in updateEntry function", error);
        res.status(500).json({ success: false, message: "Internal Server Error" }); 
    }
}

export const deleteEntry = async (req, res) => {
    try {
        const {id} = req.params
        const { user_id } = await getUserFromClerk(req)

        const [entry] = await sql`
            SELECT id FROM entries
            WHERE id = ${id} AND user_id = ${user_id}
        `;
        if (!entry) return res.status(404).json({ message: "Entry not found" });


        await sql `DELETE FROM entries WHERE id = ${id} AND user_id = ${user_id}`
        return res.status(200).json({ message: "Entry deleted" });

    } catch (error) {
        console.error("Delete entry error:", error);
        return res.status(500).json({ message: "Could not delete entry" }); 
    }
}

export const getEntries = async (req,res) => {
    try {
        const { user_id } = await getUserFromClerk(req)
        const entries = await sql`
            SELECT * FROM entries WHERE user_id = ${user_id}
            ORDER BY created_at DESC
        `;
        return res.status(200).json({ message: "Entries fetched successfully" , entries});

    } catch (error) {
        console.error("Delete entry error:", error);
        return res.status(500).json({ message: "Failed to fetch entries" }); 
    }
}

export const searchEntries = async (req, res) => {
    try {
        const { user_id } = await getUserFromClerk(req)
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });
        const { q } = req.query;
        if (!q || q.trim() === "") {
            return res.status(200).json({ success: true, data: [] });
        }
        
        const searchTerm = `%${q}%`;

        const results = await sql`
            SELECT * FROM entries e
            WHERE e.note ILIKE ${searchTerm} AND user_id = ${user_id}
            ORDER BY e.created_at DESC
        `
        res.status(200).json({ success: true, results });

    } catch (error) {
        console.error("Error in searchEntries:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}