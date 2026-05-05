import express from "express";
import {requireLogin } from "../middleware/auth.middleware.js";
import { addEntry, deleteEntry, editEntry, getEntries, searchEntries } from "../controllers/entries.controller.js";

const router = express.Router();
router.use(requireLogin)

router.get("/all", getEntries);
router.get("/search", searchEntries)
router.post("/add", addEntry);
router.put("/:id", editEntry);
router.delete("/:id", deleteEntry);

export default router;