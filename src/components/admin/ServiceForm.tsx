"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useForm, useFieldArray, type FieldErrors, type FieldError, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  serviceFormSchema,
  type ServiceValidationValues,
} from "@/lib/validations/service";
import { getUploadSignature, deleteCloudinaryAsset } from "@/actions/admin/media";
import { uploadFileWithProgress } from "@/lib/cloudinary/media-client";
import { createService, updateService } from "@/actions/admin/services";
import { Media } from "@/types";
import { motion } from "motion/react";

type ServiceFormValues = z.input<typeof serviceFormSchema>;

type ErrorRecord = { [key: string]: unknown };

function getFormError(errors: FieldErrors, path: string): FieldError | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as ErrorRecord)[part];
  }
  if (
    current &&
    typeof current === "object" &&
    "message" in current &&
    typeof (current as { message: unknown }).message === "string"
  ) {
    return current as FieldError;
  }
  return undefined;
}

type ServiceFormData = ServiceValidationValues & {
  _id?: string;
};

interface ServiceFormProps {
  initialData?: ServiceFormData; // Empty for "create" mode
}

const inputClass =
  "h-11 w-full border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-dark mt-1";
const errorClass = "text-xs font-medium text-red-700 mt-1";

export function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const mode = initialData?._id ? "edit" : "add";
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const [isPending, startTransition] = useTransition();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // File states
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialData?.coverImage?.url || null
  );

  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(
    initialData?.video?.url || null
  );
  const [deleteVideo, setDeleteVideo] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<Media[]>(
    initialData?.gallery || []
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    formState,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: {
        en: initialData?.name?.en || "",
        ar: initialData?.name?.ar || "",
      },
      slug: initialData?.slug || "",
      shortDescription: {
        en: initialData?.shortDescription?.en || "",
        ar: initialData?.shortDescription?.ar || "",
      },
      overview: {
        en: initialData?.overview?.en || "",
        ar: initialData?.overview?.ar || "",
      },
      details: initialData?.details || [{ en: "", ar: "" }],
      capabilitiesTitle: {
        en: initialData?.capabilitiesTitle?.en || "",
        ar: initialData?.capabilitiesTitle?.ar || "",
      },
      capabilities: initialData?.capabilities || [],
      benefitsTitle: {
        en: initialData?.benefitsTitle?.en || "",
        ar: initialData?.benefitsTitle?.ar || "",
      },
      benefits: initialData?.benefits || [],
      coverImage: initialData?.coverImage || undefined,
      gallery: initialData?.gallery || [],
      video: initialData?.video || undefined,
      featured: initialData?.featured || false,
      status: initialData?.status || "published",
      displayOrder: initialData?.displayOrder || 0,
    },
  });
  const { errors } = formState;

  const checkFieldErrors = (fieldError: unknown, lang: "en" | "ar"): boolean => {
    if (!fieldError || typeof fieldError !== "object") return false;
    const errObj = fieldError as Record<string, unknown>;
    return !!errObj[lang];
  };

  const checkArrayErrors = (arrayError: unknown, lang: "en" | "ar"): boolean => {
    if (!Array.isArray(arrayError)) return false;
    return arrayError.some((item) => item && checkFieldErrors(item, lang));
  };

  const checkBenefitsErrors = (benefitsError: unknown, lang: "en" | "ar"): boolean => {
    if (!Array.isArray(benefitsError)) return false;
    return benefitsError.some((item) => {
      if (!item || typeof item !== "object") return false;
      const obj = item as Record<string, unknown>;
      return obj.text && checkFieldErrors(obj.text, lang);
    });
  };

  const hasEnErrors =
    checkFieldErrors(errors.name, "en") ||
    checkFieldErrors(errors.shortDescription, "en") ||
    checkFieldErrors(errors.overview, "en") ||
    checkFieldErrors(errors.capabilitiesTitle, "en") ||
    checkFieldErrors(errors.benefitsTitle, "en") ||
    checkArrayErrors(errors.details, "en") ||
    checkArrayErrors(errors.capabilities, "en") ||
    checkBenefitsErrors(errors.benefits, "en");

  const hasArErrors =
    checkFieldErrors(errors.name, "ar") ||
    checkFieldErrors(errors.shortDescription, "ar") ||
    checkFieldErrors(errors.overview, "ar") ||
    checkFieldErrors(errors.capabilitiesTitle, "ar") ||
    checkFieldErrors(errors.benefitsTitle, "ar") ||
    checkArrayErrors(errors.details, "ar") ||
    checkArrayErrors(errors.capabilities, "ar") ||
    checkBenefitsErrors(errors.benefits, "ar");

  // Dynamic Array for Details
  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({ control, name: "details" });

  // Dynamic Array for Capabilities
  const {
    fields: capabilityFields,
    append: appendCapability,
    remove: removeCapability,
  } = useFieldArray({ control, name: "capabilities" });

  // Dynamic Array for Benefits
  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({ control, name: "benefits" });

  // Watch Name to Suggest Slug
  const nameEn = watch("name.en");
  useEffect(() => {
    if (mode === "add" && nameEn) {
      const suggestedSlug = nameEn
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", suggestedSlug, { shouldValidate: true });
    }
  }, [nameEn, setValue, mode]);

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  // Media Handlers
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast("Invalid cover image type. Allowed: JPEG, PNG, WEBP.", "error");
        if (coverInputRef.current) coverInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        showToast("Cover image exceeds maximum allowed size of 10MB.", "error");
        if (coverInputRef.current) coverInputRef.current.value = "";
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setError("coverImage", { message: undefined });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        showToast("Invalid video type. Allowed: MP4, WEBM, QUICKTIME.", "error");
        if (videoInputRef.current) videoInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        showToast("Video exceeds maximum allowed size of 100MB.", "error");
        if (videoInputRef.current) videoInputRef.current.value = "";
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setDeleteVideo(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setDeleteVideo(true);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid type)`);
      } else if (file.size > MAX_IMAGE_SIZE) {
        invalidFiles.push(`${file.name} (exceeds 10MB)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      showToast(`Rejected files: ${invalidFiles.join(", ")}`, "error");
    }

    if (validFiles.length > 0) {
      setGalleryFiles((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveNewGalleryItem = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingGalleryItem = (publicId: string) => {
    setExistingGallery((prev) => prev.filter((item) => item.publicId !== publicId));
  };

  const onInvalid = (errs: FieldErrors<ServiceFormValues>) => {
    console.log("Validation errors:", errs);
    showToast("Please complete the required fields.", "error");

    const getFirstErrorPath = (obj: Record<string, unknown>, currentPath = ""): string => {
      for (const key in obj) {
        const val = obj[key];
        if (!val || typeof val !== "object") continue;
        const path = currentPath ? `${currentPath}.${key}` : key;
        if ("message" in val && typeof (val as { message: unknown }).message === "string") {
          return path;
        }
        const childPath = getFirstErrorPath(val as Record<string, unknown>, path);
        if (childPath) return childPath;
      }
      return "";
    };

    const firstErrorPath = getFirstErrorPath(errs as unknown as Record<string, Record<string, unknown>>);
    if (firstErrorPath) {
      if (firstErrorPath.includes(".ar")) {
        setActiveTab("ar");
      } else if (firstErrorPath.includes(".en")) {
        setActiveTab("en");
      }

      setTimeout(() => {
        const firstErrorEl = document.querySelector(`[name="${firstErrorPath}"]`) as HTMLElement;
        if (firstErrorEl) {
          firstErrorEl.focus();
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const onSubmit = async (values: ServiceFormValues) => {
    // Manually validate cover image requirement
    if (mode === "add" && !coverFile) {
      setError("coverImage", { type: "manual", message: "Cover image is required" });
      showToast("Please complete the required fields.", "error");
      return;
    }
    if (mode === "edit" && !coverFile && !initialData?.coverImage) {
      setError("coverImage", { type: "manual", message: "Cover image is required" });
      showToast("Please complete the required fields.", "error");
      return;
    }

    const newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = [];
    const replacedMedia: { publicId: string; resourceType: "image" | "video" }[] = [];

    const rollbackNewUploads = async (assets: typeof newlyUploadedMedia) => {
      for (const item of assets) {
        try {
          console.log("Client rolling back asset on fail:", item.publicId);
          await deleteCloudinaryAsset(item.publicId, item.resourceType);
        } catch (e) {
          console.error("Client rollback failed for:", item.publicId, e);
        }
      }
    };

    setUploadStatus("Initializing...");

    try {
      let coverImageMetadata: Media | undefined = initialData?.coverImage;
      let videoMetadata: Media | null | undefined = deleteVideo ? null : initialData?.video;
      const newGalleryUploaded: Media[] = [];

      // 1. Upload Cover Image if selected
      if (coverFile) {
        setUploadStatus("Uploading Cover (0%)...");
        const sig = await getUploadSignature("services");
        const coverRes = await uploadFileWithProgress(coverFile, sig, "image", (p) => {
          setUploadStatus(`Uploading Cover (${p}%)...`);
        });
        newlyUploadedMedia.push({ publicId: coverRes.publicId, resourceType: "image" });
        if (initialData?.coverImage?.publicId) {
          replacedMedia.push({ publicId: initialData.coverImage.publicId, resourceType: "image" });
        }
        coverImageMetadata = coverRes;
      }

      // 2. Upload Video if selected
      if (videoFile) {
        setUploadStatus("Uploading Video (0%)...");
        const sig = await getUploadSignature("services");
        const videoRes = await uploadFileWithProgress(videoFile, sig, "video", (p) => {
          setUploadStatus(`Uploading Video (${p}%)...`);
        });
        newlyUploadedMedia.push({ publicId: videoRes.publicId, resourceType: "video" });
        if (initialData?.video?.publicId) {
          replacedMedia.push({ publicId: initialData.video.publicId, resourceType: "video" });
        }
        videoMetadata = videoRes;
      }

      // 3. Upload newly added Gallery Images
      if (galleryFiles.length > 0) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const file = galleryFiles[i];
          setUploadStatus(`Uploading Gallery ${i + 1}/${galleryFiles.length} (0%)...`);
          const sig = await getUploadSignature("services");
          const itemRes = await uploadFileWithProgress(file, sig, "image", (p) => {
            setUploadStatus(`Uploading Gallery ${i + 1}/${galleryFiles.length} (${p}%)...`);
          });
          newlyUploadedMedia.push({ publicId: itemRes.publicId, resourceType: "image" });
          newGalleryUploaded.push(itemRes);
        }
      }

      // 4. Identify deleted gallery items to put in replacedMedia
      if (mode === "edit") {
        const remainingIds = new Set(existingGallery.map((item) => item.publicId));
        const deletedGalleryItems = (initialData?.gallery || []).filter(
          (item) => !remainingIds.has(item.publicId)
        );
        deletedGalleryItems.forEach((item) => {
          replacedMedia.push({ publicId: item.publicId, resourceType: "image" });
        });
      }

      setUploadStatus("Saving...");

      const cleanCapabilitiesTitle =
        values.capabilitiesTitle && values.capabilitiesTitle.en.trim() !== ""
          ? values.capabilitiesTitle
          : undefined;

      const cleanBenefitsTitle =
        values.benefitsTitle && values.benefitsTitle.en.trim() !== ""
          ? values.benefitsTitle
          : undefined;

      const payload = {
        ...values,
        capabilitiesTitle: cleanCapabilitiesTitle,
        benefitsTitle: cleanBenefitsTitle,
        coverImage: coverImageMetadata!,
        gallery: [...existingGallery, ...newGalleryUploaded],
        video: videoMetadata,
      };

      startTransition(async () => {
        const formData = new FormData();
        formData.append("data", JSON.stringify(payload));
        formData.append("newlyUploadedMedia", JSON.stringify(newlyUploadedMedia));
        formData.append("replacedMedia", JSON.stringify(replacedMedia));

        const res =
          mode === "add"
            ? await createService(formData)
            : await updateService(initialData!._id!, formData);

        if (res.success) {
          showToast(
            mode === "add" ? "Service created successfully!" : "Service updated successfully!"
          );
          setTimeout(() => router.push("/admin/services"), 1500);
        } else {
          // MongoDB failed -> Rollback new uploads
          await rollbackNewUploads(newlyUploadedMedia);

          if (res.type === "validation" && res.fieldErrors) {
            Object.keys(res.fieldErrors).forEach((key) => {
              setError(key as FieldPath<ServiceFormValues>, {
                type: "server",
                message: res.fieldErrors![key],
              });
            });
            showToast(res.message || "Please complete the required fields.", "error");
          } else if (res.type === "conflict") {
            setError("slug", { type: "server", message: res.message });
            showToast(res.message, "error");
          } else {
            showToast(res.message || "Failed to save service.", "error");
          }
        }
        setUploadStatus(null);
      });
    } catch (err) {
      console.error("Media upload failed:", err);
      showToast(err instanceof Error ? err.message : "Media upload failed.", "error");
      await rollbackNewUploads(newlyUploadedMedia);
      setUploadStatus(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="mt-10 space-y-8">
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

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (English/Arabic inputs & arrays) */}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-dark/12 bg-white p-6 sm:p-8 shadow-sm">
          {/* Tab switcher */}
          <div className="flex border-b border-dark/8 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`relative px-4 py-2 text-xs font-semibold tracking-wider uppercase transition ${
                activeTab === "en"
                  ? "text-dark"
                  : hasEnErrors
                  ? "text-red-600 hover:text-red-700 font-bold"
                  : "text-muted hover:text-dark"
              }`}
            >
              English Content {hasEnErrors && <span className="text-red-600 ml-1">●</span>}
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent transition-transform duration-200 ${
                  activeTab === "en" ? "scale-x-100" : "scale-x-0"
                }`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ar")}
              className={`relative px-4 py-2 text-xs font-semibold tracking-wider uppercase transition ${
                activeTab === "ar"
                  ? "text-dark"
                  : hasArErrors
                  ? "text-red-600 hover:text-red-700 font-bold"
                  : "text-muted hover:text-dark"
              }`}
            >
              المحتوى العربي {hasArErrors && <span className="text-red-600 ml-1">●</span>}
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent transition-transform duration-200 ${
                  activeTab === "ar" ? "scale-x-100" : "scale-x-0"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Tab content */}
          <div className="relative">
            <motion.div
              initial={false}
              animate={{
                opacity: activeTab === "en" ? 1 : 0,
                x: activeTab === "en" ? 0 : -10,
                display: activeTab === "en" ? "block" : "none",
              }}
              transition={{ duration: 0.2 }}
              className="space-y-5 text-left"
              dir="ltr"
            >
              <label className={labelClass}>
                Service Name (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Light Gauge Steel"
                  {...register("name.en")}
                />
                {getFormError(errors, "name.en") && (
                  <p className={errorClass}>{getFormError(errors, "name.en")?.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Short Description (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Summarized row description..."
                  {...register("shortDescription.en")}
                />
                {getFormError(errors, "shortDescription.en") && (
                  <p className={errorClass}>{getFormError(errors, "shortDescription.en")?.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Overview Description (English)
                <textarea
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-dark/15 bg-transparent p-3 font-normal text-text outline-none focus:border-accent text-sm"
                  placeholder="Detail catalog description..."
                  {...register("overview.en")}
                />
                {getFormError(errors, "overview.en") && (
                  <p className={errorClass}>{getFormError(errors, "overview.en")?.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Capabilities Section Title (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Core Capabilities"
                  {...register("capabilitiesTitle.en")}
                />
              </label>

              <label className={labelClass}>
                Benefits Section Title (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Advantages & Benefits"
                  {...register("benefitsTitle.en")}
                />
              </label>
            </motion.div>

            <motion.div
              initial={false}
              animate={{
                opacity: activeTab === "ar" ? 1 : 0,
                x: activeTab === "ar" ? 0 : 10,
                display: activeTab === "ar" ? "block" : "none",
              }}
              transition={{ duration: 0.2 }}
              className="space-y-5 text-right"
              dir="rtl"
            >
              <label className={`${labelClass} text-right`}>
                اسم الخدمة (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: الهياكل الحديدية الخفيفة"
                  {...register("name.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                وصف قصير (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="وصف مختصر للجدول..."
                  {...register("shortDescription.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                نص تعريفي بالخدمة (العربية)
                <textarea
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-dark/15 bg-transparent p-3 font-normal text-text outline-none focus:border-accent text-sm text-right"
                  placeholder="وصف تفصيلي كامل للخدمة..."
                  {...register("overview.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                عنوان قسم القدرات (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: القدرات والحلول المتاحة"
                  {...register("capabilitiesTitle.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                عنوان قسم الفوائد والمزايا (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: المميزات والمنافع"
                  {...register("benefitsTitle.ar")}
                />
              </label>
            </motion.div>
          </div>

          {/* Dynamic Array Editors */}
          <div className="border-t border-dark/10 pt-6 space-y-6">
            {/* Details Editor */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-dark">
                  Service Details (Key Facts)
                </h3>
                <button
                  type="button"
                  onClick={() => appendDetail({ en: "", ar: "" })}
                  className="rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent hover:text-dark transition"
                >
                  Add Detail
                </button>
              </div>
              {getFormError(errors, "details") && (
                <p className={errorClass}>{getFormError(errors, "details")?.message}</p>
              )}
              <div className="mt-4 space-y-3">
                {detailFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end border-b border-dark/6 pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                      <label className="text-xs text-muted block">
                        Detail #{index + 1} (English)
                        <input
                          type="text"
                          required
                          className={`${inputClass} mt-1`}
                          placeholder="e.g. Design speed: 200 km/h"
                          {...register(`details.${index}.en` as const)}
                        />
                      </label>
                      <label className="text-xs text-muted block text-right" dir="rtl">
                        التفصيل #{index + 1} (العربية)
                        <input
                          type="text"
                          className={`${inputClass} mt-1 text-right`}
                          placeholder="مثال: سرعة التصميم: 200 كم/س"
                          {...register(`details.${index}.ar` as const)}
                        />
                      </label>
                    </div>
                    {detailFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDetail(index)}
                        className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities Editor */}
            <div className="border-t border-dark/8 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-dark">
                  Service Capabilities
                </h3>
                <button
                  type="button"
                  onClick={() => appendCapability({ en: "", ar: "" })}
                  className="rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent hover:text-dark transition"
                >
                  Add Capability
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {capabilityFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end border-b border-dark/6 pb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                      <label className="text-xs text-muted block">
                        Capability #{index + 1} (English)
                        <input
                          type="text"
                          required
                          className={`${inputClass} mt-1`}
                          placeholder="e.g. Precise engineering models"
                          {...register(`capabilities.${index}.en` as const)}
                        />
                      </label>
                      <label className="text-xs text-muted block text-right" dir="rtl">
                        القدرة #{index + 1} (العربية)
                        <input
                          type="text"
                          className={`${inputClass} mt-1 text-right`}
                          placeholder="القدرة والحلول المتاحة..."
                          {...register(`capabilities.${index}.ar` as const)}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCapability(index)}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Editor */}
            <div className="border-t border-dark/8 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-dark">
                  Service Benefits
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    appendBenefit({
                      title: { en: "", ar: "" },
                      text: { en: "", ar: "" },
                    })
                  }
                  className="rounded-lg bg-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent hover:text-dark transition"
                >
                  Add Benefit
                </button>
              </div>
              <div className="mt-4 space-y-5">
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end border-b border-dark/8 pb-4">
                    <div className="space-y-4 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-xs text-muted block font-semibold">
                          Benefit Title #{index + 1} (English)
                          <input
                            type="text"
                            required
                            className={`${inputClass} mt-1`}
                            placeholder="e.g. Speed of construction"
                            {...register(`benefits.${index}.title.en` as const)}
                          />
                        </label>
                        <label className="text-xs text-muted block font-semibold text-right" dir="rtl">
                          عنوان الميزة #{index + 1} (العربية)
                          <input
                            type="text"
                            className={`${inputClass} mt-1 text-right`}
                            placeholder="العنوان بالعربية..."
                            {...register(`benefits.${index}.title.ar` as const)}
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-xs text-muted block">
                          Benefit Description (English)
                          <input
                            type="text"
                            required
                            className={`${inputClass} mt-1`}
                            placeholder="Detailed advantage details..."
                            {...register(`benefits.${index}.text.en` as const)}
                          />
                        </label>
                        <label className="text-xs text-muted block text-right" dir="rtl">
                          وصف الميزة بالكامل (العربية)
                          <input
                            type="text"
                            className={`${inputClass} mt-1 text-right`}
                            placeholder="شرح وتفصيل الميزة بالعربية..."
                            {...register(`benefits.${index}.text.ar` as const)}
                          />
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (General details, slug, cover, video, gallery, actions) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Service Settings
            </h3>

            <label className={labelClass}>
              URL Slug
              <input
                type="text"
                required
                className={inputClass}
                placeholder="e.g. light-gauge-steel"
                {...register("slug")}
              />
              {getFormError(errors, "slug") && (
                <p className={errorClass}>{getFormError(errors, "slug")?.message}</p>
              )}
            </label>

            <div className="flex items-center justify-between border-t border-dark/6 pt-4">
              <span className="text-sm font-semibold text-dark">
                Featured offering
              </span>
              <button
                type="button"
                onClick={() => setValue("featured", !watch("featured"))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  watch("featured") ? "bg-accent" : "bg-dark/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    watch("featured") ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-dark/6 pt-4">
              <span className="text-sm font-semibold text-dark">
                Publishing Status
              </span>
              <select
                className="rounded-lg border border-dark/15 p-2 bg-transparent text-sm text-dark outline-none focus:border-accent"
                {...register("status")}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Cover image Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Cover Image
            </h3>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="h-28 w-44 flex items-center justify-center rounded-lg border border-dark/12 bg-secondary/35 p-2 overflow-hidden">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-muted font-medium">No Image Chosen</span>
                )}
              </div>
              <input
                type="file"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="w-full rounded-lg border border-dark/12 bg-white py-2 text-xs font-semibold text-dark hover:bg-dark/5 transition"
              >
                Choose Cover Image
              </button>
              {getFormError(errors, "coverImage") && (
                <p className={`${errorClass} mt-2 text-center`}>
                  {getFormError(errors, "coverImage")?.message}
                </p>
              )}
            </div>
          </div>

          {/* Video upload Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Service Video (Optional)
            </h3>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="h-28 w-44 flex items-center justify-center rounded-lg border border-dark/12 bg-secondary/35 p-2 overflow-hidden relative">
                {videoPreview ? (
                  <video
                    src={videoPreview}
                    controls
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-muted font-medium">No Video Chosen</span>
                )}
              </div>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <div className="w-full flex gap-3">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex-1 rounded-lg border border-dark/12 bg-white py-2 text-xs font-semibold text-dark hover:bg-dark/5 transition"
                >
                  Choose Video
                </button>
                {videoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs font-semibold hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Gallery Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Gallery Images
            </h3>

            {/* Existing images list */}
            {existingGallery.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                  Existing Gallery
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {existingGallery.map((item) => (
                    <div
                      key={item.publicId}
                      className="h-12 w-full rounded border border-dark/6 bg-secondary/25 overflow-hidden relative group"
                    >
                      <img src={item.url} alt="Gallery thumb" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingGalleryItem(item.publicId)}
                        className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150"
                        title="Remove image"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New previews list */}
            {galleryPreviews.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">
                  Newly Added Previews
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {galleryPreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      className="h-12 w-full rounded border border-accent/25 bg-secondary/25 overflow-hidden relative group"
                    >
                      <img src={preview} alt="New preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewGalleryItem(idx)}
                        className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150"
                        title="Remove item"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-dark/20 py-3 text-xs font-semibold text-muted hover:border-dark/35 transition"
            >
              + Add Gallery Images
            </button>
          </div>

          {/* Action buttons */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending || !!uploadStatus}
              className="w-full inline-flex justify-center rounded-xl bg-dark px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark disabled:opacity-50"
            >
              {uploadStatus
                ? uploadStatus
                : isPending
                ? "Saving offering..."
                : mode === "add"
                ? "Create Service"
                : "Save Service Details"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/services")}
              className="w-full inline-flex justify-center rounded-xl border border-dark/12 bg-white px-6 py-3 text-sm font-semibold text-dark hover:bg-dark/5 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
