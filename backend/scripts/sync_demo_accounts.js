import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";

async function syncUsers() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const plainPassword = "Password123!";
  const hash = await bcrypt.hash(plainPassword, 10);

  // 1. student@quimora.com
  await mongoose.connection.db.collection("users").updateOne(
    { email: "student@quimora.com" },
    {
      $set: {
        name: "Alex Johnson",
        username: "student_alex",
        email: "student@quimora.com",
        password: hash,
        role: "user",
        active: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // 2. student@test.com
  await mongoose.connection.db.collection("users").updateOne(
    { email: "student@test.com" },
    { $set: { password: hash, active: true } }
  );

  // 3. instructor@quimora.com
  await mongoose.connection.db.collection("users").updateOne(
    { email: "instructor@quimora.com" },
    {
      $set: {
        name: "Prof. Sarah Connor",
        username: "prof_sarah",
        email: "instructor@quimora.com",
        password: hash,
        role: "instructor",
        active: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("✅ Credentials synced successfully for:");
  console.log(" - student@quimora.com / Password123!");
  console.log(" - student@test.com / Password123!");
  console.log(" - instructor@quimora.com / Password123!");
  process.exit(0);
}

syncUsers().catch((err) => {
  console.error("Error syncing users:", err);
  process.exit(1);
});
