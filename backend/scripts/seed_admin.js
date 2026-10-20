import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quimora";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@quimora.com";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  if (!ADMIN_PASSWORD) {
    console.error(
      "❌ ADMIN_PASSWORD environment variable is required to seed admin user."
    );
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB for Admin Seed...");
    await mongoose.connect(MONGO_URI);

    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (adminUser) {
      adminUser.password = ADMIN_PASSWORD;
      adminUser.role = "admin";
      adminUser.active = true;
      adminUser.suspendedAt = null;
      adminUser.suspendedReason = null;
      await adminUser.save();
      console.log(`✅ Admin user '${ADMIN_EMAIL}' updated successfully!`);
    } else {
      let targetUsername = ADMIN_USERNAME;
      const usernameExists = await User.findOne({ username: targetUsername });
      if (usernameExists) {
        targetUsername = `${ADMIN_USERNAME}_${Math.floor(1000 + Math.random() * 9000)}`;
        console.warn(`⚠️ Username '${ADMIN_USERNAME}' taken; falling back to '${targetUsername}'.`);
      }

      adminUser = await User.create({
        name: "System Admin",
        email: ADMIN_EMAIL,
        username: targetUsername,
        password: ADMIN_PASSWORD,
        role: "admin",
        active: true,
      });
      console.log(`✅ Admin user '${ADMIN_EMAIL}' created successfully with username '${targetUsername}'!`);
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedAdmin();
