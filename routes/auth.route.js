import express from "express";
import { requireLogin } from "../middleware/auth.middleware.js";
import { createProfile, getUserProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/create-profile", requireLogin, createProfile);
router.get("/user-profile", requireLogin, getUserProfile);

export default router;