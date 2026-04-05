import mongoose from "mongoose";
import Campus from "../models/Campus.js";
import dotenv from "dotenv";

dotenv.config();

const campuses = [
  { name: "DBIT - Don Bosco Institute of Technology", domain: "dbit.in", city: "Mumbai" },
  { name: "VJTI - Veermata Jijabai Technological Institute", domain: "vjti.ac.in", city: "Mumbai" },
  { name: "IIT Bombay", domain: "iitb.ac.in", city: "Mumbai" },
  { name: "NMIMS", domain: "nmims.edu", city: "Mumbai" }
];

export const seedCampuses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB for seeding...");

    await Campus.deleteMany({});
    await Campus.insertMany(campuses);

    console.log("✅ Database Seeded: 4 Campuses added.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};