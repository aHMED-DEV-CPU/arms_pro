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

async function reset() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("ERROR: ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables.");
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("Connecting to database...");
    await dbConnect();
    console.log("Connected to MongoDB Atlas!");

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      console.error(`ERROR: Admin user with email "${normalizedEmail}" not found in database.`);
      process.exit(1);
    }

    console.log("Hashing new password...");
    const passwordHash = await bcrypt.hash(password, 12);

    console.log("Updating Admin password...");
    admin.passwordHash = passwordHash;
    await admin.save();

    console.log(`SUCCESS: Password for Admin user "${normalizedEmail}" has been reset successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("Admin password reset failed:", err);
    process.exit(1);
  }
}

reset();
