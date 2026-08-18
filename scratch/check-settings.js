const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

function loadEnv() {
  const root = "d:/ITI scolarship/Freelance project/arms_pro/arms_pro";
  const files = [".env.local", ".env"];
  for (const file of files) {
    const filePath = path.join(root, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...parts] = trimmed.split("=");
          const value = parts.join("=").replace(/^["']|["']$/g, "").trim();
          process.env[key.trim()] = value;
        }
      }
    }
  }
}

loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGODB_URI found!");
  process.exit(1);
}

const SocialLinksSchema = new mongoose.Schema(
  {
    instagram: { type: String },
    linkedin: { type: String },
    x: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    whatsapp: { type: String },
    tiktok: { type: String },
  },
  { _id: false }
);

const CompanySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: Object },
    about: { type: Object },
    phone: { type: String },
    email: { type: String },
    founderEmail: { type: String },
    salesEmail: { type: String },
    contactEmail: { type: String },
    address: { type: Object },
    commercialRegistration: { type: String },
    unifiedEstablishmentNumber: { type: String },
    vatNumber: { type: String },
    socialLinks: { type: SocialLinksSchema },
  },
  { timestamps: true, collection: "companysettings" }
);

// Delete model cache if exists to avoid overwrite error
delete mongoose.models.CompanySettings;
const CompanySettings = mongoose.model("CompanySettings", CompanySettingsSchema);

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB.");
    let doc = await CompanySettings.findOne();
    console.log("Before update:", doc.socialLinks);
    
    // Test write
    doc.socialLinks.tiktok = "https://www.tiktok.com/@test";
    await doc.save();
    
    doc = await CompanySettings.findOne();
    console.log("After update:", doc.socialLinks);
    
    // Revert it back to empty
    doc.socialLinks.tiktok = "";
    await doc.save();
    console.log("Reverted back to empty.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
