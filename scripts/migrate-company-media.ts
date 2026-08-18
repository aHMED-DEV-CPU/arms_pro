/* eslint-disable @typescript-eslint/no-require-imports */
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

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

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const dbConnect = require("../src/lib/db/mongoose").default;
const CompanySettings = require("../src/models/CompanySettings").default;

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await dbConnect();
    console.log("Connected to MongoDB!");

    let settings = await CompanySettings.findOne();
    if (!settings) {
      console.log("No CompanySettings document found. Initializing new one...");
      settings = new CompanySettings({
        companyName: { en: "ARMS PRO Group", ar: "" },
        about: {
          en: "ARMS PRO is a Saudi group providing integrated construction, design, finishing, structural systems, and architectural solutions for residential, commercial, hospitality, and specialized projects.",
          ar: ""
        },
        phone: "0551119136",
        email: "ahmedgaber@gmail.com",
        founderEmail: "",
        salesEmail: "",
        contactEmail: "ahmedgaber@gmail.com",
        address: { en: "Al Muzahimiyah – OMDB 4216 – Al Hada – 19651", ar: "" },
        commercialRegistration: "1111103343",
        unifiedEstablishmentNumber: "7039472662",
        vatNumber: "312627669500003"
      });
    }

    const folder = "arms-pro/company";

    // 1. Migrate Logo
    if (!settings.logo || !settings.logo.url) {
      const logoPath = path.join(process.cwd(), "public", "images", "branding", "logo", "logo.png");
      if (fs.existsSync(logoPath)) {
        console.log("Uploading logo from:", logoPath);
        const uploadRes = await cloudinary.uploader.upload(logoPath, { folder });
        settings.logo = {
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id
        };
        console.log("Logo migrated:", settings.logo);
      } else {
        console.warn("Logo file not found at:", logoPath);
      }
    } else {
      console.log("Logo already exists in settings:", settings.logo);
    }

    // 2. Migrate Hero Cover
    if (!settings.heroImage || !settings.heroImage.url) {
      const heroPath = path.join(process.cwd(), "public", "images", "home", "hero", "hero.jpeg");
      if (fs.existsSync(heroPath)) {
        console.log("Uploading hero cover from:", heroPath);
        const uploadRes = await cloudinary.uploader.upload(heroPath, { folder });
        settings.heroImage = {
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id
        };
        console.log("Hero cover migrated:", settings.heroImage);
      } else {
        console.warn("Hero file not found at:", heroPath);
      }
    } else {
      console.log("Hero cover already exists in settings:", settings.heroImage);
    }

    // 3. Migrate About section image (independently uploaded duplicate)
    if (!settings.aboutImage || !settings.aboutImage.url) {
      const heroPath = path.join(process.cwd(), "public", "images", "home", "hero", "hero.jpeg");
      if (fs.existsSync(heroPath)) {
        console.log("Uploading a separate copy of about image from:", heroPath);
        const uploadRes = await cloudinary.uploader.upload(heroPath, { folder });
        settings.aboutImage = {
          url: uploadRes.secure_url,
          publicId: uploadRes.public_id
        };
        console.log("About section image migrated:", settings.aboutImage);
      } else {
        console.warn("About source file not found at:", heroPath);
      }
    } else {
      console.log("About image already exists in settings:", settings.aboutImage);
    }

    await settings.save();
    console.log("SUCCESS: CompanySettings media migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
