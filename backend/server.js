import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("PassItOn API running");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});