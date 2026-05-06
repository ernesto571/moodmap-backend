import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "../routes/auth.route.js" 
import entryRoutes from "../routes/entry.route.js" 
import reportsRoute from "../routes/reports.route.js" 
import cron from 'node-cron';
import { clerkMiddleware } from "@clerk/express";
 
import "dotenv/config";
import { generateWeeklyReports } from "../controllers/reports.controller.js";

const app = express();

app.use(clerkMiddleware()); 

app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/entry", entryRoutes);
app.use("/api/report", reportsRoute);


cron.schedule('0 22 * * 0', async () => {
    console.log('🕐 Running weekly report generation...');
    await generateWeeklyReports();
});

// generateWeeklyReports()

// Log all requests
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`); // Fixed: parentheses, not backticks
    next();
});


export default app;