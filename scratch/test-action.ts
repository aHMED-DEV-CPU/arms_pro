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
const { updateCompanySettings } = require("../src/actions/admin/settings");

async function run() {
  await dbConnect();
  const settings = await CompanySettings.findOne().lean();
  if (settings) {
    // Construct the exact payload submitted by the form
    const formValues = {
      companyName: {
        en: settings.companyName.en,
        ar: settings.companyName.ar,
      },
      about: {
        en: settings.about.en,
        ar: settings.about.ar,
      },
      phone: settings.phone,
      email: settings.email,
      address: {
        en: settings.address.en,
        ar: settings.address.ar,
      },
      commercialRegistration: settings.commercialRegistration,
      unifiedEstablishmentNumber: settings.unifiedEstablishmentNumber,
      vatNumber: settings.vatNumber,
      socialLinks: settings.socialLinks,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(formValues));

    console.log("Submitting formData with email:", settings.email);
    const res = await updateCompanySettings(formData);
    console.log("Server action response:", res);
  } else {
    console.log("No settings document found!");
  }
  process.exit(0);
}

run();
