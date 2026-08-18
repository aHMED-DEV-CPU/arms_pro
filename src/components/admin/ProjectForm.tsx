"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useForm, type FieldErrors, type FieldError, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  projectFormSchema,
  type ProjectValidationValues,
} from "@/lib/validations/project";
import { getUploadSignature, deleteCloudinaryAsset } from "@/actions/admin/media";
import { uploadFileWithProgress } from "@/lib/cloudinary/media-client";
import { createProject, updateProject } from "@/actions/admin/projects";
import { Media } from "@/types";

type ProjectFormValues = z.input<typeof projectFormSchema>;

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

type ProjectFormData = ProjectValidationValues & {
  _id?: string;
};

interface ProjectFormProps {
  initialData?: ProjectFormData; // Empty for "create" mode
}

const inputClass =
  "h-11 w-full border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-dark mt-1";
const errorClass = "text-xs font-medium text-red-700 mt-1";

export function ProjectForm({ initialData }: ProjectFormProps) {
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
    setValue,
    watch,
    setError,
    formState,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: {
        en: initialData?.title?.en || "",
        ar: initialData?.title?.ar || "",
      },
      slug: initialData?.slug || "",
      category: {
        en: initialData?.category?.en || "",
        ar: initialData?.category?.ar || "",
      },
      shortDescription: {
        en: initialData?.shortDescription?.en || "",
        ar: initialData?.shortDescription?.ar || "",
      },
      fullDescription: {
        en: initialData?.fullDescription?.en || "",
        ar: initialData?.fullDescription?.ar || "",
      },
      coverImage: initialData?.coverImage || undefined,
      gallery: initialData?.gallery || [],
      video: initialData?.video || undefined,
      featured: initialData?.featured || false,
      status: initialData?.status || "completed",
      displayOrder: initialData?.displayOrder || 0,
    },
  });
  const { errors } = formState;

  const checkFieldErrors = (fieldError: unknown, lang: "en" | "ar"): boolean => {
    if (!fieldError || typeof fieldError !== "object") return false;
    const errObj = fieldError as Record<string, unknown>;
    return !!errObj[lang];
  };

  const hasEnErrors =
    checkFieldErrors(errors.title, "en") ||
    checkFieldErrors(errors.category, "en") ||
    checkFieldErrors(errors.shortDescription, "en") ||
    checkFieldErrors(errors.fullDescription, "en");

  const hasArErrors =
    checkFieldErrors(errors.title, "ar") ||
    checkFieldErrors(errors.category, "ar") ||
    checkFieldErrors(errors.shortDescription, "ar") ||
    checkFieldErrors(errors.fullDescription, "ar");

  // Watch Title to Suggest Slug
  const titleEn = watch("title.en");
  useEffect(() => {
    if (mode === "add" && titleEn) {
      const suggestedSlug = titleEn
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", suggestedSlug, { shouldValidate: true });
    }
  }, [titleEn, setValue, mode]);

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

  const onInvalid = (errs: FieldErrors<ProjectFormValues>) => {
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

  const onSubmit = async (values: ProjectFormValues) => {
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
        const sig = await getUploadSignature("projects");
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
        const sig = await getUploadSignature("projects");
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
          const sig = await getUploadSignature("projects");
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

      const payload = {
        ...values,
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
            ? await createProject(formData)
            : await updateProject(initialData!._id!, formData);

        if (res.success) {
          showToast(
            mode === "add" ? "Project created successfully!" : "Project updated successfully!"
          );
          setTimeout(() => router.push("/admin/projects"), 1500);
        } else {
          // MongoDB failed -> Rollback new uploads
          await rollbackNewUploads(newlyUploadedMedia);

          if (res.type === "validation" && res.fieldErrors) {
            Object.keys(res.fieldErrors).forEach((key) => {
              setError(key as FieldPath<ProjectFormValues>, {
                type: "server",
                message: res.fieldErrors![key],
              });
            });
            showToast(res.message || "Please complete the required fields.", "error");
          } else if (res.type === "conflict") {
            setError("slug", { type: "server", message: res.message });
            showToast(res.message, "error");
          } else {
            showToast(res.message || "Failed to save project.", "error");
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
        {/* Left Column (Inputs) */}
        <div className="lg:col-span-2 space-y-6 rounded-xl border border-dark/12 bg-white p-6 sm:p-8 shadow-sm">
          {/* Tab switcher */}
          <div className="flex border-b border-dark/8 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition ${
                activeTab === "en"
                  ? "border-accent text-dark"
                  : hasEnErrors
                  ? "border-red-500 text-red-600 hover:text-red-700 font-bold"
                  : "border-transparent text-muted hover:text-dark"
              }`}
            >
              English Content {hasEnErrors && <span className="text-red-600 ml-1">●</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ar")}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase border-b-2 transition ${
                activeTab === "ar"
                  ? "border-accent text-dark"
                  : hasArErrors
                  ? "border-red-500 text-red-600 hover:text-red-700 font-bold"
                  : "border-transparent text-muted hover:text-dark"
              }`}
            >
              المحتوى العربي {hasArErrors && <span className="text-red-600 ml-1">●</span>}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "en" ? (
            <div className="space-y-5">
              <label className={labelClass}>
                Project Title (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Swaed Steel Office"
                  {...register("title.en")}
                />
                {getFormError(errors, "title.en") && (
                  <p className={errorClass}>{getFormError(errors, "title.en")?.message}</p>
                )}
              </label>

              <label className={labelClass}>
                Project Category (English)
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Commercial, Industrial"
                  {...register("category.en")}
                />
                {getFormError(errors, "category.en") && (
                  <p className={errorClass}>{getFormError(errors, "category.en")?.message}</p>
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
                Full Project Description (English)
                <textarea
                  rows={6}
                  className="mt-2 w-full resize-none rounded-lg border border-dark/15 bg-transparent p-3 font-normal text-text outline-none focus:border-accent text-sm"
                  placeholder="Full portfolio description..."
                  {...register("fullDescription.en")}
                />
                {getFormError(errors, "fullDescription.en") && (
                  <p className={errorClass}>{getFormError(errors, "fullDescription.en")?.message}</p>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-5" dir="rtl">
              <label className={`${labelClass} text-right`}>
                عنوان المشروع (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: مبنى مكاتب شركة سواعد"
                  {...register("title.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                تصنيف المشروع (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="مثال: تجاري، صناعي"
                  {...register("category.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                وصف قصير للمشروع (العربية)
                <input
                  type="text"
                  className={`${inputClass} text-right`}
                  placeholder="وصف مختصر للجدول..."
                  {...register("shortDescription.ar")}
                />
              </label>

              <label className={`${labelClass} text-right`}>
                الوصف الكامل والتفصيلي (العربية)
                <textarea
                  rows={6}
                  className="mt-2 w-full resize-none rounded-lg border border-dark/15 bg-transparent p-3 font-normal text-text outline-none focus:border-accent text-sm text-right"
                  placeholder="التفاصيل الهندسية الكاملة للمشروع..."
                  {...register("fullDescription.ar")}
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Column (General, slug, cover, video, gallery, actions) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold tracking-wide text-dark uppercase border-b border-dark/8 pb-3">
              Project Settings
            </h3>

            <label className={labelClass}>
              URL Slug
              <input
                type="text"
                required
                className={inputClass}
                placeholder="e.g. swaed-steel-office"
                {...register("slug")}
              />
              {getFormError(errors, "slug") && (
                <p className={errorClass}>{getFormError(errors, "slug")?.message}</p>
              )}
            </label>

            <div className="flex items-center justify-between border-t border-dark/6 pt-4">
              <span className="text-sm font-semibold text-dark">
                Featured project
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
                Project Status
              </span>
              <select
                className="rounded-lg border border-dark/15 p-2 bg-transparent text-sm text-dark outline-none focus:border-accent"
                {...register("status")}
              >
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="upcoming">Upcoming</option>
                <option value="on-hold">On Hold</option>
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
              Project Video (Optional)
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
                ? "Saving project..."
                : mode === "add"
                ? "Create Project"
                : "Save Project Details"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/projects")}
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
