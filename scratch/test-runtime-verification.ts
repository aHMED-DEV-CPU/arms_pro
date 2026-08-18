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

// Imports
const dbConnect = require("../src/lib/db/mongoose").default;
const CompanySettings = require("../src/models/CompanySettings").default;
const Service = require("../src/models/Service").default;
const Project = require("../src/models/Project").default;
const { getLocalizedValue } = require("../src/lib/i18n");
const { companySettingsValidationSchema } = require("../src/lib/validations/company-settings");

async function run() {
  await dbConnect();
  console.log("Connected to MongoDB.");

  // Save original states to restore later
  const originalSettings = await CompanySettings.findOne();
  const serviceToTest = await Service.findOne({ slug: "light-gauge-steel" });
  const projectToTest = await Project.findOne({ slug: "project-01" });

  console.log("Original data cached for safety and restoration.");

  // 1. Company Settings Verification
  console.log("\n=================== VERIFICATION 1: Company Settings ===================");
  if (originalSettings) {
    const testSettingsData = {
      companyName: {
        en: "Test ARMS PRO Group EN",
        ar: "مجموعة أرمز برو التجريبية"
      },
      phone: originalSettings.phone,
      email: originalSettings.email,
      founderEmail: originalSettings.founderEmail,
      salesEmail: originalSettings.salesEmail,
      contactEmail: originalSettings.contactEmail,
      address: {
        en: "Test Address EN",
        ar: "العنوان التجريبي بالعربية"
      },
      commercialRegistration: originalSettings.commercialRegistration,
      unifiedEstablishmentNumber: originalSettings.unifiedEstablishmentNumber,
      vatNumber: originalSettings.vatNumber,
      socialLinks: originalSettings.socialLinks || {},
      logo: originalSettings.logo,
      heroImage: originalSettings.heroImage,
      aboutImage: originalSettings.aboutImage,
      about: {
        en: "Brief EN",
        ar: "نبذة AR"
      },
      aboutParagraphs: [
        { en: "Test Paragraph 1 EN", ar: "الفقرة التجريبية الأولى" },
        { en: "Test Paragraph 2 EN", ar: "الفقرة التجريبية الثانية" },
        { en: "Test Paragraph 3 EN", ar: "الفقرة التجريبية الثالثة" }
      ]
    };

    // Validate using Zod schema
    const validatedSettings = companySettingsValidationSchema.parse(testSettingsData);
    console.log("Zod Schema Validation for CompanySettings: SUCCESS");

    // Save to Database
    await CompanySettings.findByIdAndUpdate(originalSettings._id, validatedSettings);
    console.log("Saved test CompanySettings to database.");

    // Retrieve and verify
    let dbSettings = await CompanySettings.findById(originalSettings._id);
    console.log("Retrieved companyName (en):", dbSettings.companyName.en);
    console.log("Retrieved companyName (ar):", dbSettings.companyName.ar);
    console.log("Retrieved address (en):", dbSettings.address.en);
    console.log("Retrieved address (ar):", dbSettings.address.ar);
    console.log("Retrieved aboutParagraphs count:", dbSettings.aboutParagraphs.length);
    console.log("Retrieved aboutParagraphs (ar) values:", dbSettings.aboutParagraphs.map((p: any) => p.ar));

    // Test Move Up / Move Down / Remove
    const paragraphs = [...dbSettings.aboutParagraphs];
    // Move index 2 to 0 (Move Up)
    const [p3] = paragraphs.splice(2, 1);
    paragraphs.unshift(p3); // New order: P3, P1, P2
    // Remove middle (index 1 which is P1)
    paragraphs.splice(1, 1); // New order: P3, P2

    console.log("Locally manipulated paragraphs. Remaining count: " + paragraphs.length + ". Expected order: P3, P2");

    dbSettings.aboutParagraphs = paragraphs;
    await dbSettings.save();

    let updatedDbSettings = await CompanySettings.findById(originalSettings._id);
    console.log("Updated aboutParagraphs count in MongoDB:", updatedDbSettings.aboutParagraphs.length);
    console.log("Updated aboutParagraphs order (en):", updatedDbSettings.aboutParagraphs.map((p: any) => p.en));
    console.log("Updated aboutParagraphs order (ar):", updatedDbSettings.aboutParagraphs.map((p: any) => p.ar));
  } else {
    console.log("Skipping Company Settings verification (no document).");
  }

  // 2. Service Verification
  console.log("\n=================== VERIFICATION 2: Service ===================");
  if (serviceToTest) {
    const testServiceData = {
      name: { en: "Test Service EN", ar: "الخدمة التجريبية" },
      shortDescription: { en: "Short Desc EN", ar: "الوصف القصير التجريبي" },
      overview: { en: "Overview EN", ar: "النظرة العامة التجريبية" },
      capabilitiesTitle: { en: "Capabilities Title EN", ar: "عنوان القدرات التجريبي" },
      details: [
        { en: "Detail 1 EN", ar: "التفاصيل ١" },
        { en: "Detail 2 EN", ar: "التفاصيل ٢" }
      ],
      capabilities: [
        { en: "Capability 1 EN", ar: "القدرة ١" },
        { en: "Capability 2 EN", ar: "القدرة ٢" }
      ],
      benefitsTitle: { en: "Benefits Title EN", ar: "عنوان المزايا التجريبي" },
      benefits: [
        {
          title: { en: "Benefit Title 1 EN", ar: "عنوان المزية ١" },
          text: { en: "Benefit Text 1 EN", ar: "نص المزية ١" }
        },
        {
          title: { en: "Benefit Title 2 EN", ar: "عنوان المزية ٢" },
          text: { en: "Benefit Text 2 EN", ar: "نص المزية ٢" }
        }
      ]
    };

    // Update in database
    await Service.findByIdAndUpdate(serviceToTest._id, testServiceData);
    console.log("Saved test Service to database.");

    // Retrieve and verify
    let dbService = await Service.findById(serviceToTest._id);
    console.log("Retrieved name (en):", dbService.name.en);
    console.log("Retrieved name (ar):", dbService.name.ar);
    console.log("Retrieved shortDescription (ar):", dbService.shortDescription.ar);
    console.log("Retrieved details (ar):", dbService.details.map((d: any) => d.ar));
    console.log("Retrieved benefits (ar):", dbService.benefits.map((b: any) => ({ title: b.title.ar, text: b.text.ar })));

    // 3. Service Array Pairing Verification
    console.log("\n=================== VERIFICATION 3: Service Array Pairing ===================");
    // Remove middle detail (index 0)
    dbService.details.splice(0, 1);
    // Add a new bilingual capability at the end
    dbService.capabilities.push({ en: "New Cap EN", ar: "قدرة جديدة" });
    await dbService.save();

    let updatedDbService = await Service.findById(serviceToTest._id);
    console.log("Bilingual details count (expected 1):", updatedDbService.details.length);
    console.log("Detail[0] EN:", updatedDbService.details[0].en, "AR:", updatedDbService.details[0].ar);
    console.log("Bilingual capabilities count (expected 3):", updatedDbService.capabilities.length);
    console.log("Capabilities pairing check (en/ar at same index):");
    updatedDbService.capabilities.forEach((c: any, index: number) => {
      console.log(`  Index ${index} - EN: "${c.en}" | AR: "${c.ar}"`);
    });

    // 4. Fallback Verification
    console.log("\n=================== VERIFICATION 4: Fallback Behavior ===================");
    // Clear Arabic fields on Service
    dbService.capabilitiesTitle = { en: "Capabilities Title EN", ar: "" };
    dbService.name = { en: "Test Service EN", ar: "" };
    await dbService.save();

    let fallbackDbService = await Service.findById(serviceToTest._id);
    console.log("DB capabilitiesTitle (ar) is empty string:", JSON.stringify(fallbackDbService.capabilitiesTitle.ar));
    console.log("DB name (ar) is empty string:", JSON.stringify(fallbackDbService.name.ar));

    // Test getLocalizedValue resolver
    const resolvedTitleAR = getLocalizedValue(fallbackDbService.capabilitiesTitle, "ar");
    const resolvedNameAR = getLocalizedValue(fallbackDbService.name, "ar");
    console.log("Resolved capabilitiesTitle in Arabic (should fallback):", resolvedTitleAR);
    console.log("Resolved name in Arabic (should fallback):", resolvedNameAR);
  } else {
    console.log("Skipping Service verification (no document).");
  }

  // 5. Project Verification
  console.log("\n=================== VERIFICATION 5: Project ===================");
  if (projectToTest) {
    const testProjectData = {
      title: { en: "Test Project EN", ar: "المشروع التجريبي" },
      category: { en: "Category EN", ar: "التصنيف التجريبي" },
      shortDescription: { en: "Short Desc EN", ar: "الوصف القصير التجريبي" },
      fullDescription: { en: "Full Desc EN", ar: "الوصف الكامل التجريبي" }
    };

    // Update in database
    await Project.findByIdAndUpdate(projectToTest._id, testProjectData);
    console.log("Saved test Project to database.");

    // Retrieve and verify
    let dbProject = await Project.findById(projectToTest._id);
    console.log("Retrieved title (en):", dbProject.title.en);
    console.log("Retrieved title (ar):", dbProject.title.ar);
    console.log("Retrieved category (ar):", dbProject.category.ar);
    console.log("Retrieved shortDescription (ar):", dbProject.shortDescription.ar);
    console.log("Retrieved fullDescription (ar):", dbProject.fullDescription.ar);

    // Clear Arabic fields to test Project Fallback
    dbProject.category = { en: "Category EN", ar: "" };
    await dbProject.save();

    let fallbackDbProject = await Project.findById(projectToTest._id);
    const resolvedCategoryAR = getLocalizedValue(fallbackDbProject.category, "ar");
    console.log("Resolved category in Arabic with missing field (should fallback):", resolvedCategoryAR);
  } else {
    console.log("Skipping Project verification (no document).");
  }

  // Restore database values exactly
  console.log("\n=================== RESTORING ORIGINAL DATA ===================");
  if (originalSettings) {
    await CompanySettings.findByIdAndUpdate(originalSettings._id, originalSettings.toObject());
    console.log("CompanySettings restored.");
  }
  if (serviceToTest) {
    await Service.findByIdAndUpdate(serviceToTest._id, serviceToTest.toObject());
    console.log("Service restored.");
  }
  if (projectToTest) {
    await Project.findByIdAndUpdate(projectToTest._id, projectToTest.toObject());
    console.log("Project restored.");
  }
  console.log("Database restored completely.");

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
