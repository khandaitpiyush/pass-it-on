import Campus from "../models/Campus.js";

const campuses = [
  { name: "DBIT - Don Bosco Institute of Technology", domain: "dbit.in", city: "Mumbai" },
  { name: "VJTI - Veermata Jijabai Technological Institute", domain: "vjti.ac.in", city: "Mumbai" },
  { name: "IIT Bombay", domain: "iitb.ac.in", city: "Mumbai" },
  { name: "NMIMS", domain: "nmims.edu", city: "Mumbai" }
];

export const seedCampuses = async () => {
  try {
    const existing = await Campus.countDocuments();

    // Only seed if collection is empty — never wipe existing data
    if (existing > 0) {
      console.log(`ℹ️  Campuses already seeded (${existing} found), skipping.`);
      return;
    }

    await Campus.insertMany(campuses);
    console.log("✅ Campuses seeded successfully.");

  } catch (err) {
    console.error("❌ Campus seeding failed:", err);
  }
};