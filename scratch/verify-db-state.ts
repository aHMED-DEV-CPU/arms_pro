import fs from "fs";
import path from "path";

// Synchronously load env variables
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
const Service = require("../src/models/Service").default;
const Project = require("../src/models/Project").default;

async function check() {
  await dbConnect();
  console.log("=================== DB INSPECTION START ===================");

  // 1. Company Settings
  const settings = await CompanySettings.findOne();
  if (settings) {
    console.log("--- Company Settings ---");
    console.log("companyName:", JSON.stringify(settings.companyName, null, 2));
    console.log("address:", JSON.stringify(settings.address, null, 2));
    console.log("aboutParagraphs (length = " + (settings.aboutParagraphs?.length || 0) + "):", JSON.stringify(settings.aboutParagraphs, null, 2));
  } else {
    console.log("No Company Settings found!");
  }

  // 2. Services
  const services = await Service.find().limit(2);
  console.log("\n--- Services (Count: " + services.length + ") ---");
  for (const s of services) {
    console.log(`Service: ${s.slug}`);
    console.log("name:", JSON.stringify(s.name, null, 2));
    console.log("shortDescription:", JSON.stringify(s.shortDescription, null, 2));
    console.log("overview:", JSON.stringify(s.overview, null, 2));
    console.log("details (length = " + (s.details?.length || 0) + "):", JSON.stringify(s.details, null, 2));
    console.log("capabilitiesTitle:", JSON.stringify(s.capabilitiesTitle, null, 2));
    console.log("capabilities (length = " + (s.capabilities?.length || 0) + "):", JSON.stringify(s.capabilities, null, 2));
    console.log("benefitsTitle:", JSON.stringify(s.benefitsTitle, null, 2));
    console.log("benefits (length = " + (s.benefits?.length || 0) + "):", JSON.stringify(s.benefits, null, 2));
    console.log("------------------------");
  }

  // 3. Projects
  const projects = await Project.find().limit(2);
  console.log("\n--- Projects (Count: " + projects.length + ") ---");
  for (const p of projects) {
    console.log(`Project: ${p.slug}`);
    console.log("title:", JSON.stringify(p.title, null, 2));
    console.log("category:", JSON.stringify(p.category, null, 2));
    console.log("shortDescription:", JSON.stringify(p.shortDescription, null, 2));
    console.log("fullDescription:", JSON.stringify(p.fullDescription, null, 2));
    console.log("------------------------");
  }

  console.log("==================== DB INSPECTION END ====================");
  process.exit(0);
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
