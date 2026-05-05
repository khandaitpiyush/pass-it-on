import express from "express";
import Campus from "../models/Campus.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const campuses = await Campus.find({ isActive: true });
    res.json(campuses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch campuses" });
  }
});

export default router;