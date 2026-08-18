"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  companySettingsValidationSchema,
} from "@/lib/validations/company-settings";
import { updateCompanySettings } from "@/actions/admin/settings";
import { getUploadSignature } from "@/actions/admin/media";
import { uploadFileWithProgress } from "@/lib/cloudinary/media-client";
import type { Media } from "@/types";

type CompanySettingsFormValues = z.input<typeof companySettingsValidationSchema>;

type SettingsData = CompanySettingsFormValues & {
  logo?: { url: string; publicId: string };
  heroImage?: { url: string; publicId: string };
  aboutImage?: { url: string; publicId: string };
};

interface CompanySettingsFormProps {
  initialSettings: SettingsData;
}

const inputClass =
  "h-11 w-full border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-dark mt-1";
const errorClass = "text-xs font-medium text-red-700 mt-1";

export function CompanySettingsForm({ initialSettings }: CompanySettingsFormProps) {
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const [isPending, startTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Constants for central image validation
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndSetImage = (
    file: File,
    setFileState: (f: File) => void,
    setPreviewState: (p: string) => void
  ) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Invalid image type. Allowed: JPEG, PNG, WEBP.", "error");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast("Image must be 10 MB or smaller.", "error");
      return;
    }
    setFileState(file);
    setPreviewState(URL.createObjectURL(file));
  };

  // Logo upload state
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialSettings.logo?.url || null
  );

  // Hero Image upload state
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(
    initialSettings.heroImage?.url || null
  );

  // About Image upload state
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const [aboutFile, setAboutFile] = useState<File | null>(null);
  const [aboutPreview, setAboutPreview] = useState<string | null>(
    initialSettings.aboutImage?.url || null
  );

  const handleAboutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file, setAboutFile, setAboutPreview);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file, setLogoFile, setLogoPreview);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file, setHeroFile, setHeroPreview);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsValidationSchema),
    defaultValues: {
      companyName: {
        en: initialSettings.companyName.en || "",
        ar: initialSettings.companyName.ar || "",
      },
      about: {
        en: initialSettings.about?.en || "",
        ar: initialSettings.about?.ar || "",
      },
      aboutParagraphs: initialSettings.aboutParagraphs || [],
      phone: initialSettings.phone || "",
      email: initialSettings.email || "",
      founderEmail: initialSettings.founderEmail || "",
      salesEmail: initialSettings.salesEmail || "",
      contactEmail: initialSettings.contactEmail || "",
      address: {
        en: initialSettings.address.en || "",
        ar: initialSettings.address.ar || "",
      },
      commercialRegistration: initialSettings.commercialRegistration || "",
      unifiedEstablishmentNumber: initialSettings.unifiedEstablishmentNumber || "",
      vatNumber: initialSettings.vatNumber || "",
      socialLinks: {
        instagram: initialSettings.socialLinks?.instagram || "",
        linkedin: initialSettings.socialLinks?.linkedin || "",
        x: initialSettings.socialLinks?.x || "",
        facebook: initialSettings.socialLinks?.facebook || "",
        youtube: initialSettings.socialLinks?.youtube || "",
        whatsapp: initialSettings.socialLinks?.whatsapp || "",
        tiktok: initialSettings.socialLinks?.tiktok || "",
      },
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "aboutParagraphs",
  });

  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });

    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000) as unknown as number;
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const onSubmit = async (values: CompanySettingsFormValues) => {
    const newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = [];

    startTransition(async () => {
      try {
        let logoMetadata = initialSettings.logo;
        let heroImageMetadata = initialSettings.heroImage;
        let aboutImageMetadata = initialSettings.aboutImage;

        // 1. Logo
        if (logoFile) {
          setUploadStatus("Uploading Logo (0%)...");
          const sig = await getUploadSignature("company");
          const logoRes = await uploadFileWithProgress(logoFile, sig, "image", (p) => {
            setUploadStatus(`Uploading Logo (${p}%)...`);
          });
          newlyUploadedMedia.push({ publicId: logoRes.publicId, resourceType: "image" });
          logoMetadata = logoRes;
        }

        // 2. Hero Image
        if (heroFile) {
          setUploadStatus("Uploading Hero Cover (0%)...");
          const sig = await getUploadSignature("company");
          const heroRes = await uploadFileWithProgress(heroFile, sig, "image", (p) => {
            setUploadStatus(`Uploading Hero Cover (${p}%)...`);
          });
          newlyUploadedMedia.push({ publicId: heroRes.publicId, resourceType: "image" });
          heroImageMetadata = heroRes;
        }

        // 3. About Section Image
        if (aboutFile) {
          setUploadStatus("Uploading About Image (0%)...");
          const sig = await getUploadSignature("company");
          const aboutRes = await uploadFileWithProgress(aboutFile, sig, "image", (p) => {
            setUploadStatus(`Uploading About Image (${p}%)...`);
          });
          newlyUploadedMedia.push({ publicId: aboutRes.publicId, resourceType: "image" });
          aboutImageMetadata = aboutRes;
        }

        setUploadStatus("Saving settings...");
        const saveValues = {
          ...values,
          logo: logoMetadata,
          heroImage: heroImageMetadata,
          aboutImage: aboutImageMetadata,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(saveValues));
        formData.append("newlyUploadedMedia", JSON.stringify(newlyUploadedMedia));

        const res = await updateCompanySettings(formData);
        if (res.success) {
          showToast("Company settings successfully updated.");
          setLogoFile(null);
          setHeroFile(null);
          setAboutFile(null);
        } else {
          showToast(res.error || "Failed to update settings.", "error");
        }
      } catch (err) {
        console.error("Direct upload or settings save failed:", err);
        showToast(err instanceof Error ? err.message : "Failed to update settings.", "error");
      } finally {
        setUploadStatus(null);
      }
    });
  };

  return (
    // eslint-disable-next-line react-hooks/refs
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-lg transition-all duration-300 border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Columns (Form details) */}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-dark/12 bg-white p-6 sm:p-8 shadow-sm">
          {/* Tabs header */}
          <div className="flex border-b border-dark/8 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition ${
                activeTab === "en"
                  ? "border-accent text-dark"
                  : "border-transparent text-muted hover:text-dark"
              }`}
            >
              English Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ar")}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition ${
                activeTab === "ar"
                  ? "border-accent text-dark"
                  : "border-transparent text-muted hover:text-dark"
              }`}
            >
              المحتوى العربي
            </button>
          </div>

          {/* Localized Content fields */}
          {activeTab === "en" ? (
            <div className="space-y-5">
              <label className={labelClass}>
                Company Name (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. ARMS PRO Contracting"
                  {...register("companyName.en")}
                />
                {errors.companyName?.en && (
                  <p className={errorClass}>{errors.companyName.en.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Address (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Al Malqa District, Riyadh, KSA"
                  {...register("address.en")}
                />
                {errors.address?.en && (
                  <p className={errorClass}>{errors.address.en.message}</p>
                )}
              </label>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-dark/8 pb-2">
                  <span className={labelClass}>About Paragraphs (English)</span>
                  <button
                    type="button"
                    onClick={() => append({ en: "", ar: "" })}
                    className="inline-flex items-center gap-1 rounded bg-dark/5 px-2.5 py-1 text-xs font-semibold text-dark hover:bg-dark/10 transition"
                  >
                    + Add Paragraph
                  </button>
                </div>
                {errors.aboutParagraphs?.message && (
                  <p className={errorClass}>{errors.aboutParagraphs.message as string}</p>
                )}
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-4 text-xs font-semibold text-muted shrink-0 w-6 text-center">
                          #{index + 1}
                        </span>
                        <textarea
                          rows={3}
                          className="w-full resize-none rounded-lg border border-dark/15 bg-transparent p-3 font-normal text-text outline-none focus:border-accent text-sm"
                          placeholder={`Paragraph ${index + 1} (English)...`}
                          {...register(`aboutParagraphs.${index}.en` as const)}
                        />
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => move(index, index - 1)}
                            className="p-1.5 rounded hover:bg-dark/5 text-muted hover:text-dark disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="Move Up"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            disabled={index === fields.length - 1}
                            onClick={() => move(index, index + 1)}
                            className="p-1.5 rounded hover:bg-dark/5 text-muted hover:text-dark disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="Move Down"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                            title="Remove"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {errors.aboutParagraphs?.[index]?.en && (
                        <p className={`${errorClass} pl-8`}>
                          {errors.aboutParagraphs[index].en.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5" dir="rtl">
              <label className={`${labelClass} text-right`}>
                اسم الشركة (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: شركة أرمز برو للمقاولات"
                  {...register("companyName.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                العنوان (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: حي الملقا، الرياض، المملكة العربية السعودية"
                  {...register("address.ar")}
                />
              </label>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-dark/8 pb-2">
                  <span className={`${labelClass} text-right w-full`}>عن الشركة - الفقرات (العربية)</span>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-start gap-2.5" dir="rtl">
                        <span className="mt-4 text-xs font-semibold text-muted shrink-0 w-6 text-center">
                          #{index + 1}
                        </span>
                        <textarea
                          rows={3}
                          className="w-full resize-none rounded-lg border border-dark/15 bg-transparent p-3 font-normal text-text outline-none focus:border-accent text-sm text-right"
                          placeholder={`الفقرة ${index + 1} (باللغة العربية)...`}
                          {...register(`aboutParagraphs.${index}.ar` as const)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shared Office Info */}
          <div className="border-t border-dark/10 pt-6">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase mb-4">
              Office Information
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Phone Number
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="+966 50 000 0000"
                  {...register("phone")}
                />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </label>

              <label className={labelClass}>
                Email Address
                <input
                  type="email"
                  className={inputClass}
                  placeholder="info@swed.com.sa"
                  {...register("email")}
                />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </label>

              <label className={labelClass}>
                Commercial Registration (CR)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="1010XXXXXX"
                  {...register("commercialRegistration")}
                />
                {errors.commercialRegistration && (
                  <p className={errorClass}>{errors.commercialRegistration.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Unified Est. Number
                <input
                  type="text"
                  className={inputClass}
                  placeholder="700XXXXXXX"
                  {...register("unifiedEstablishmentNumber")}
                />
                {errors.unifiedEstablishmentNumber && (
                  <p className={errorClass}>{errors.unifiedEstablishmentNumber.message}</p>
                )}
              </label>

              <label className={labelClass}>
                VAT Tax Number
                <input
                  type="text"
                  className={inputClass}
                  placeholder="300XXXXXXXXXXXX"
                  {...register("vatNumber")}
                />
                {errors.vatNumber && (
                  <p className={errorClass}>{errors.vatNumber.message}</p>
                )}
              </label>
            </div>
          </div>

          {/* Company Contacts */}
          <div className="border-t border-dark/10 pt-6">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase mb-4">
              Company Contacts
            </h3>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className={labelClass}>
                Founder Email
                <input
                  type="email"
                  className={inputClass}
                  placeholder="founder@arms-pro.co"
                  {...register("founderEmail")}
                />
                {errors.founderEmail && (
                  <p className={errorClass}>{errors.founderEmail.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Sales & Business Development Manager Email
                <input
                  type="email"
                  className={inputClass}
                  placeholder="sales@arms-pro.co"
                  {...register("salesEmail")}
                />
                {errors.salesEmail && (
                  <p className={errorClass}>{errors.salesEmail.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Contact Us Email
                <input
                  type="email"
                  className={inputClass}
                  placeholder="contact@arms-pro.co"
                  {...register("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className={errorClass}>{errors.contactEmail.message}</p>
                )}
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-dark/10 pt-6">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase mb-4">
              Social Media Handles
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>
                Instagram URL
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://instagram.com/..."
                  {...register("socialLinks.instagram")}
                />
                {errors.socialLinks?.instagram && (
                  <p className={errorClass}>{errors.socialLinks.instagram.message}</p>
                )}
              </label>

              <label className={labelClass}>
                LinkedIn URL
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://linkedin.com/company/..."
                  {...register("socialLinks.linkedin")}
                />
                {errors.socialLinks?.linkedin && (
                  <p className={errorClass}>{errors.socialLinks.linkedin.message}</p>
                )}
              </label>

              <label className={labelClass}>
                X / Twitter URL
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://x.com/..."
                  {...register("socialLinks.x")}
                />
                {errors.socialLinks?.x && (
                  <p className={errorClass}>{errors.socialLinks.x.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Facebook URL
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://facebook.com/..."
                  {...register("socialLinks.facebook")}
                />
                {errors.socialLinks?.facebook && (
                  <p className={errorClass}>{errors.socialLinks.facebook.message}</p>
                )}
              </label>

              <label className={labelClass}>
                YouTube URL
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://youtube.com/..."
                  {...register("socialLinks.youtube")}
                />
                {errors.socialLinks?.youtube && (
                  <p className={errorClass}>{errors.socialLinks.youtube.message}</p>
                )}
              </label>

              <label className={labelClass}>
                WhatsApp Number
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. 966500000000"
                  {...register("socialLinks.whatsapp")}
                />
              </label>

              <label className={labelClass}>
                TikTok URL
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://tiktok.com/@..."
                  {...register("socialLinks.tiktok")}
                />
                {errors.socialLinks?.tiktok && (
                  <p className={errorClass}>{errors.socialLinks.tiktok.message}</p>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right Columns (Media Assets Upload) */}
        <div className="space-y-6">
          {/* Logo Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Corporate Logo
            </h3>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="h-28 w-44 flex items-center justify-center rounded-lg border border-dark/12 bg-secondary/35 p-4 overflow-hidden">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted font-medium">No Logo Chosen</span>
                )}
              </div>
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full rounded-lg border border-dark/12 bg-white py-2 text-xs font-semibold text-dark hover:bg-dark/5 transition"
              >
                Choose Logo Image
              </button>
            </div>
          </div>

          {/* Hero Image Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Hero Cover Background
            </h3>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="h-28 w-44 flex items-center justify-center rounded-lg border border-dark/12 bg-secondary/35 p-2 overflow-hidden">
                {heroPreview ? (
                  <img
                    src={heroPreview}
                    alt="Hero image preview"
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-muted font-medium">No Image Chosen</span>
                )}
              </div>
              <input
                type="file"
                ref={heroInputRef}
                accept="image/*"
                onChange={handleHeroChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                className="w-full rounded-lg border border-dark/12 bg-white py-2 text-xs font-semibold text-dark hover:bg-dark/5 transition"
              >
                Choose Hero Cover
              </button>
            </div>
          </div>

          {/* About Image Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              About Section & Page Image
            </h3>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="h-28 w-44 flex items-center justify-center rounded-lg border border-dark/12 bg-secondary/35 p-2 overflow-hidden">
                {aboutPreview ? (
                  <img
                    src={aboutPreview}
                    alt="About image preview"
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-muted font-medium">No Image Chosen</span>
                )}
              </div>
              <input
                type="file"
                ref={aboutInputRef}
                accept="image/*"
                onChange={handleAboutChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => aboutInputRef.current?.click()}
                className="w-full rounded-lg border border-dark/12 bg-white py-2 text-xs font-semibold text-dark hover:bg-dark/5 transition"
              >
                Choose About Image
              </button>
            </div>
          </div>

          {/* Save Action Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase">
              Save Changes
            </h3>
            <p className="text-xs text-muted/80 leading-normal">
              Saving updates CR, phone, email, and social networks dynamically. Changes reflect instantly on footer and contacts.
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex justify-center rounded-xl bg-dark px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark disabled:opacity-50"
            >
              {isPending ? uploadStatus || "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
