
export const buildWeeklyReportPrompt = (entries, weekStart, weekEnd) => {
    const entryList = entries.map((e) =>
        `- Date: ${new Date(e.created_at).toDateString()}, Mood: ${e.mood}, Energy: ${e.energy}/5, Score: ${e.score}, Note: "${e.note}"`
    ).join("\n");

    return `
        You are a warm, insightful personal mood coach AI.
        Analyze the user's mood entries for the week below and return a JSON object only.
        No explanation, no markdown, no code blocks — just raw JSON.

        WEEK START: ${new Date(weekStart).toDateString()}
        WEEK END: ${new Date(weekEnd).toDateString()}
        TOTAL ENTRIES: ${entries.length}

        USER ENTRIES:
        ${entryList}

        Return this exact JSON structure:
        {
            "week_range": "<format the week as e.g. Apr 28 — May 4, 2026 using the WEEK START and WEEK END dates above>",
            "total_entries": ${entries.length},
            "avg_score": <average of all entry scores rounded to 1 decimal>,
            "best_day": {
                "day": "<short day name e.g. Wed>",
                "score": <number>
            },
            "worst_day": {
                "day": "<short day name e.g. Mon>",
                "score": <number>
            },
            "pattern_summary": "<3-5 sentences, warm and coach-like tone, speak directly to the user as 'you'. Be specific — reference actual days, moods, and notes. Highlight what drove the highs and lows this week.>",
            "daily_breakdown": [
                { "day": "Mon", "score": <number or null> },
                { "day": "Tue", "score": <number or null> },
                { "day": "Wed", "score": <number or null> },
                { "day": "Thu", "score": <number or null> },
                { "day": "Fri", "score": <number or null> },
                { "day": "Sat", "score": <number or null> },
                { "day": "Sun", "score": <number or null> }
            ],
            "good_day_triggers": ["<keyword theme>"],
            "bad_day_triggers": ["<keyword theme>"],
            "key_insight": "<2-3 sentences max. The single most important pattern worth acting on. Be specific, direct, and reference actual patterns from the entries. Should feel like advice from a coach who read every entry.>"
        }

        Rules:
        - week_range: format using WEEK START and WEEK END — e.g. "Apr 28 — May 4, 2026"
        - total_entries_sent: must equal exactly ${entries.length} — this is the count of entries provided above
        - avg_score: calculate from provided entries only, round to 1 decimal
        - best_day: entry with the highest score — use short day name e.g. "Wed"
        - worst_day: entry with the lowest score — use short day name e.g. "Mon"
        - daily_breakdown: always return all 7 days — null for days with no entry, never skip a day
        - good_day_triggers: 2-5 short keywords from notes on higher scoring days e.g. "exercise", "deep work"
        - bad_day_triggers: 2-5 short keywords from notes on lower scoring days e.g. "poor sleep", "meetings"
        - pattern_summary: warm, direct, reference specific days and notes from the entries
        - key_insight: 2-3 sentences only, punchy and specific — the ONE pattern most worth acting on
        - return ONLY the JSON object, nothing else
    `;
};