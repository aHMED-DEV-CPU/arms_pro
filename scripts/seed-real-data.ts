/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

// Manually load env variables synchronously before loading anything else
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

// Load configurations and helpers via require to avoid ESM hoisting issues
const dbConnect = require("../src/lib/db/mongoose").default;
const Service = require("../src/models/Service").default;
const Project = require("../src/models/Project").default;
const Partner = require("../src/models/Partner").default;
const CompanySettings = require("../src/models/CompanySettings").default;
const { services: staticServices, featuredServiceSlugs } = require("../src/data/services");
const { projects: staticProjects, featuredProjectSlugs } = require("../src/data/projects");
const { uploadAsset } = require("../src/lib/cloudinary/media");
const { labelFromFileName } = require("../src/lib/utils/media");
const { File } = require("node:buffer");

const serviceOrderMapping: Record<string, number> = {
  "light-gauge-steel": 1,
  "building-designs": 2,
  "foam-stone": 3,
  "modern-villa-architecture": 4,
  "building": 5,
  "modular-cabins-mobile-units": 6,
  "site-progress-construction": 7,
  "our-work-from-inside": 8,
  "khema": 9,
};

const projectOrderMapping: Record<string, number> = {
  "project-01": 1,
  "project-02": 2,
  "project-03": 3,
  "project-04": 4,
  "project-05": 5,
  "project-06": 6,
  "project-07": 7,
};

// Helper to determine mime type from extension
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".mp4") return "video/mp4";
  return "application/octet-stream";
}

// Helper to prepare local file as File object for uploader
async function prepareFile(localPath: string): Promise<any> {
  const buffer = fs.readFileSync(localPath);
  const mimeType = getMimeType(localPath);
  return new File([buffer], path.basename(localPath), { type: mimeType });
}

// Track migration metrics
const stats = {
  uploadedAssets: 0,
  reusedAssets: 0,
  skippedAssets: 0,
};

async function seed() {
  try {
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Connected to MongoDB Atlas!");

    // --- 1. SEED SERVICES ---
    console.log("\n====================================");
    console.log("Migrating Services...");
    console.log("====================================");

    for (const staticS of staticServices) {
      console.log(`Processing service: ${staticS.title} (${staticS.slug})...`);
      const existing = await Service.findOne({ slug: staticS.slug });

      let coverImage = existing?.coverImage;
      const gallery = existing?.gallery || [];
      let video = existing?.video;

      const localDir = path.join(process.cwd(), "public", "images", "services", staticS.imageFolder);
      const localVideoDir = path.join(process.cwd(), "public", "videos", "services", staticS.imageFolder);

      // Check Cover Image
      if (coverImage && coverImage.url && coverImage.publicId) {
        console.log(`  - Reusing existing Cloudinary coverImage for ${staticS.slug}`);
        stats.reusedAssets++;
      } else {
        const coverPath = path.join(localDir, "cover.webp");
        if (fs.existsSync(coverPath)) {
          console.log(`  - Uploading cover image from ${coverPath}...`);
          const file = await prepareFile(coverPath);
          coverImage = await uploadAsset(file, "services", "image");
          stats.uploadedAssets++;
        } else {
          console.warn(`  - WARNING: Local cover image not found for ${staticS.slug} at ${coverPath}`);
        }
      }

      // Check Gallery
      if (gallery && gallery.length > 0) {
        console.log(`  - Reusing existing Cloudinary gallery for ${staticS.slug} (${gallery.length} items)`);
        stats.reusedAssets += gallery.length;
      } else {
        if (fs.existsSync(localDir)) {
          const files = fs.readdirSync(localDir);
          for (const f of files) {
            if (f !== "cover.webp" && f !== "cover.jpg" && f !== "cover.png" && !fs.lstatSync(path.join(localDir, f)).isDirectory()) {
              const imgPath = path.join(localDir, f);
              console.log(`  - Uploading gallery image ${f}...`);
              const file = await prepareFile(imgPath);
              const uploaded = await uploadAsset(file, "services", "image");
              gallery.push(uploaded);
              stats.uploadedAssets++;
            }
          }
        }
      }

      // Check Video
      if (video && video.url && video.publicId) {
        console.log(`  - Reusing existing Cloudinary video for ${staticS.slug}`);
        stats.reusedAssets++;
      } else {
        if (fs.existsSync(localVideoDir)) {
          const files = fs.readdirSync(localVideoDir);
          const videoFile = files.find(f => f.endsWith(".mp4") || f.endsWith(".webm"));
          if (videoFile) {
            const videoPath = path.join(localVideoDir, videoFile);
            console.log(`  - Uploading video ${videoFile}...`);
            const file = await prepareFile(videoPath);
            video = await uploadAsset(file, "services", "video");
            stats.uploadedAssets++;
          }
        }
      }

      // Prepare fields matching LocalizedString schema
      const mappedDetails = (staticS.details || []).map((p: string) => ({ en: p, ar: "" }));
      const mappedCapabilities = (staticS.capabilities || []).map((p: string) => ({ en: p, ar: "" }));
      const mappedBenefits = (staticS.benefits || []).map((b: any) => ({
        title: { en: b.title, ar: "" },
        text: { en: b.text, ar: "" },
      }));

      const serviceData = {
        name: { en: staticS.title, ar: "" },
        slug: staticS.slug,
        shortDescription: { en: staticS.shortDescription, ar: "" },
        overview: { en: staticS.overview || staticS.fullDescription, ar: "" },
        details: mappedDetails,
        capabilitiesTitle: staticS.capabilitiesTitle ? { en: staticS.capabilitiesTitle, ar: "" } : undefined,
        capabilities: mappedCapabilities.length ? mappedCapabilities : undefined,
        benefitsTitle: staticS.benefitsTitle ? { en: staticS.benefitsTitle, ar: "" } : undefined,
        benefits: mappedBenefits.length ? mappedBenefits : undefined,
        coverImage,
        gallery,
        video,
      };

      if (existing) {
        // Update document but preserve displayOrder, featured, status, and Cloudinary media we just resolved
        await Service.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...serviceData,
              // Explicitly preserve these admin-managed fields
              displayOrder: existing.displayOrder ?? serviceOrderMapping[staticS.slug] ?? 0,
              featured: existing.featured ?? featuredServiceSlugs.includes(staticS.slug),
              status: existing.status ?? "published",
            }
          }
        );
        console.log(`  - Service ${staticS.slug} UPDATED.`);
      } else {
        // Create new
        const displayOrder = serviceOrderMapping[staticS.slug] || 0;
        const featured = featuredServiceSlugs.includes(staticS.slug);
        await Service.create({
          ...serviceData,
          displayOrder,
          featured,
          status: "published",
        });
        console.log(`  - Service ${staticS.slug} CREATED.`);
      }
    }

    // --- 2. SEED PROJECTS ---
    console.log("\n====================================");
    console.log("Migrating Projects...");
    console.log("====================================");

    for (const staticP of staticProjects) {
      console.log(`Processing project: ${staticP.title} (${staticP.slug})...`);
      const existing = await Project.findOne({ slug: staticP.slug });

      let coverImage = existing?.coverImage;
      const gallery = existing?.gallery || [];
      let video = existing?.video;

      const localDir = path.join(process.cwd(), "public", "images", "projects", staticP.folder);
      const localVideoDir = path.join(process.cwd(), "public", "videos", "projects", staticP.folder);

      // Check Cover Image
      if (coverImage && coverImage.url && coverImage.publicId) {
        console.log(`  - Reusing existing Cloudinary coverImage for ${staticP.slug}`);
        stats.reusedAssets++;
      } else {
        const coverPath = path.join(localDir, "cover.webp");
        if (fs.existsSync(coverPath)) {
          console.log(`  - Uploading cover image from ${coverPath}...`);
          const file = await prepareFile(coverPath);
          coverImage = await uploadAsset(file, "projects", "image");
          stats.uploadedAssets++;
        } else {
          console.warn(`  - WARNING: Local cover image not found for ${staticP.slug} at ${coverPath}`);
        }
      }

      // Check Gallery
      if (gallery && gallery.length > 0) {
        console.log(`  - Reusing existing Cloudinary gallery for ${staticP.slug} (${gallery.length} items)`);
        stats.reusedAssets += gallery.length;
      } else {
        if (fs.existsSync(localDir)) {
          const files = fs.readdirSync(localDir);
          for (const f of files) {
            if (f !== "cover.webp" && f !== "cover.jpg" && f !== "cover.png" && !fs.lstatSync(path.join(localDir, f)).isDirectory()) {
              const imgPath = path.join(localDir, f);
              console.log(`  - Uploading gallery image ${f}...`);
              const file = await prepareFile(imgPath);
              const uploaded = await uploadAsset(file, "projects", "image");
              gallery.push(uploaded);
              stats.uploadedAssets++;
            }
          }
        }
      }

      // Check Video
      if (video && video.url && video.publicId) {
        console.log(`  - Reusing existing Cloudinary video for ${staticP.slug}`);
        stats.reusedAssets++;
      } else {
        if (fs.existsSync(localVideoDir)) {
          const files = fs.readdirSync(localVideoDir);
          const videoFile = files.find(f => f.endsWith(".mp4") || f.endsWith(".webm"));
          if (videoFile) {
            const videoPath = path.join(localVideoDir, videoFile);
            console.log(`  - Uploading video ${videoFile}...`);
            const file = await prepareFile(videoPath);
            video = await uploadAsset(file, "projects", "video");
            stats.uploadedAssets++;
          }
        }
      }

      const projectData = {
        title: { en: staticP.title, ar: "" },
        slug: staticP.slug,
        category: { en: staticP.category || "Construction", ar: "" },
        shortDescription: { en: "Selected ARMS PRO construction showcase project.", ar: "" },
        fullDescription: { en: "A complete contracting and structural delivery highlighting our group expertise.", ar: "" },
        coverImage,
        gallery,
        video,
      };

      if (existing) {
        await Project.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...projectData,
              displayOrder: existing.displayOrder ?? projectOrderMapping[staticP.slug] ?? 0,
              featured: existing.featured ?? featuredProjectSlugs.includes(staticP.slug),
              status: existing.status ?? "completed",
            }
          }
        );
        console.log(`  - Project ${staticP.slug} UPDATED.`);
      } else {
        const displayOrder = projectOrderMapping[staticP.slug] || 0;
        const featured = featuredProjectSlugs.includes(staticP.slug);
        await Project.create({
          ...projectData,
          displayOrder,
          featured,
          status: "completed",
        });
        console.log(`  - Project ${staticP.slug} CREATED.`);
      }
    }

    // --- 3. SEED PARTNERS ---
    console.log("\n====================================");
    console.log("Migrating Partners...");
    console.log("====================================");

    const partnersDir = path.join(process.cwd(), "public", "images", "partners");
    if (fs.existsSync(partnersDir)) {
      const files = fs.readdirSync(partnersDir);
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if ([".webp", ".png", ".jpg", ".jpeg"].includes(ext)) {
          const partnerName = labelFromFileName(f)
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          console.log(`Processing partner: ${partnerName}...`);
          const existing = await Partner.findOne({ name: partnerName });

          if (existing) {
            console.log(`  - Reusing existing partner logo for ${partnerName}`);
            stats.reusedAssets++;
            console.log(`  - Partner ${partnerName} PRESERVED.`);
          } else {
            const logoPath = path.join(partnersDir, f);
            console.log(`  - Uploading logo from ${logoPath}...`);
            const file = await prepareFile(logoPath);
            const logo = await uploadAsset(file, "partners", "image");
            stats.uploadedAssets++;

            await Partner.create({
              name: partnerName,
              logo,
              active: true,
            });
            console.log(`  - Partner ${partnerName} CREATED.`);
          }
        }
      }
    }

    // --- 4. SEED COMPANY SETTINGS ---
    console.log("\n====================================");
    console.log("Migrating Company Settings...");
    console.log("====================================");

    const existingSettings = await CompanySettings.findOne();
    if (existingSettings) {
      console.log("CompanySettings already exists. PRESERVED.");
    } else {
      console.log("Creating CompanySettings document...");
      await CompanySettings.create({
        companyName: { en: "ARMS PRO Group", ar: "" },
        about: {
          en: "ARMS PRO is a Saudi group providing integrated construction, design, finishing, structural systems, and architectural solutions for residential, commercial, hospitality, and specialized projects.",
          ar: ""
        },
        phone: "0551119136",
        email: "INFO@SWAED.COM.SA",
        founderEmail: "",
        salesEmail: "",
        contactEmail: "INFO@SWAED.COM.SA",
        address: { en: "Al Muzahimiyah – OMDB 4216 – Al Hada – 19651", ar: "" },
        commercialRegistration: "1111103343",
        unifiedEstablishmentNumber: "7039472662",
        vatNumber: "312627669500003",
        socialLinks: {
          instagram: "",
          linkedin: "",
          x: "",
          facebook: "",
          youtube: "",
          whatsapp: "",
          tiktok: "",
        }
      });
      console.log("CompanySettings CREATED.");
    }

    console.log("\n====================================");
    console.log("MIGRATION COMPLETED SUCCESSFULLY!");
    console.log(`Uploaded Assets count: ${stats.uploadedAssets}`);
    console.log(`Reused Assets count: ${stats.reusedAssets}`);
    console.log("====================================");

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

seed();
