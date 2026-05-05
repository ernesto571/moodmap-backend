import express from "express";
import { requireLogin } from "../middleware/auth.middleware.js";
import { getReports } from "../controllers/reports.controller.js";

const router = express.Router();

router.get("/all", requireLogin, getReports);

export default router;