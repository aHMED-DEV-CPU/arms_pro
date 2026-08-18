import fs from "fs";
import path from "path";

// Synchronously load env
const envPaths = [
  path.join(process.cwd(), ".env.local"),
  path.join(process.cwd(), ".env")
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
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
const CompanySettings = require("../src/models/CompanySettings").default;
const { companySettingsValidationSchema } = require("../src/lib/validations/company-settings");

async function check() {
  await dbConnect();
  const settings = await CompanySettings.findOne().lean();
  if (settings) {
    console.log("Raw settings:", settings);
    try {
      companySettingsValidationSchema.parse(settings);
      console.log("SUCCESS: companySettingsValidationSchema parsed successfully!");
    } catch (err: any) {
      console.error("Zod validation failed:", err.errors || err);
    }
  } else {
    console.log("No settings document found!");
  }
  process.exit(0);
}

check();
