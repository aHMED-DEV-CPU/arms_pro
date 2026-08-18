/* eslint-disable @typescript-eslint/no-require-imports */
import fs from "fs";
import path from "path";

// Synchronously load env
const envPaths = [
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), ".env")
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    console.log("Loading environment from:", p);
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[0].split("=")[0].trim();
        let val = match[0].substring(match[0].indexOf("=") + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
}

const dbConnect = require("../src/lib/db/mongoose").default;
const Admin = require("../src/models/Admin").default;
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("ERROR: ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables.");
      process.exit(1);
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("ERROR: Invalid ADMIN_EMAIL format.");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("ERROR: ADMIN_PASSWORD should be at least 6 characters long.");
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("Connecting to database...");
    await dbConnect();
    console.log("Connected to MongoDB Atlas!");

    const existing = await Admin.findOne({ email: normalizedEmail });

    if (existing) {
      console.log(`Admin user with email "${normalizedEmail}" already exists. Skipping creation.`);
      console.log("Password hash remains unchanged.");
    } else {
      console.log("Hashing password...");
      const passwordHash = await bcrypt.hash(password, 12);

      console.log("Creating Admin user...");
      await Admin.create({
        email: normalizedEmail,
        passwordHash,
        active: true,
      });

      console.log(`Admin user with email "${normalizedEmail}" successfully created!`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Admin seeding failed:", err);
    process.exit(1);
  }
}

seed();
