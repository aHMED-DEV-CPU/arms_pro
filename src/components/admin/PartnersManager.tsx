"use client";

import { useState, useTransition, useRef } from "react";
import {
  createPartner,
  updatePartner,
  deletePartner,
  togglePartnerActive,
} from "@/actions/admin/partners";
import { getUploadSignature } from "@/actions/admin/media";
import { uploadFileWithProgress } from "@/lib/cloudinary/media-client";

type PartnerItem = {
  _id: string;
  name: string;
  logo: { url: string; publicId: string };
  websiteUrl?: string;
  active: boolean;
};

interface PartnersManagerProps {
  initialPartners: PartnerItem[];
}

export function PartnersManager({ initialPartners }: PartnersManagerProps) {
  const [partners, setPartners] = useState<PartnerItem[]>(initialPartners);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Unified Add/Edit Form Modal State
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    partnerId?: string;
    name: string;
    websiteUrl: string;
    active: boolean;
    logoUrl?: string; // For previewing existing logo
    logo?: { url: string; publicId: string };
  }>({ isOpen: false, mode: "add", name: "", websiteUrl: "", active: true });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    partnerId: string;
    partnerName: string;
  }>({ isOpen: false, partnerId: "", partnerName: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
      const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        showToast("Invalid image type. Allowed: JPEG, PNG, WEBP.", "error");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        showToast("Image must be 10 MB or smaller.", "error");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    const newActive = !currentActive;
    setPartners((prev) =>
      prev.map((p) => (p._id === id ? { ...p, active: newActive } : p))
    );

    startTransition(async () => {
      const res = await togglePartnerActive(id, newActive);
      if (res.success) {
        showToast(
          newActive ? "Partner activated." : "Partner deactivated."
        );
      } else {
        showToast("Failed to toggle status.", "error");
        // Revert
        setPartners((prev) =>
          prev.map((p) => (p._id === id ? { ...p, active: currentActive } : p))
        );
      }
    });
  };

  const openAddModal = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormModal({
      isOpen: true,
      mode: "add",
      name: "",
      websiteUrl: "",
      active: true,
    });
  };

  const openEditModal = (partner: PartnerItem) => {
    setLogoFile(null);
    setLogoPreview(null);
    setFormModal({
      isOpen: true,
      mode: "edit",
      partnerId: partner._id,
      name: partner.name,
      websiteUrl: partner.websiteUrl || "",
      active: partner.active,
      logoUrl: partner.logo.url,
      logo: partner.logo,
    });
  };

  const triggerDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, partnerId: id, partnerName: name });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.name.trim()) {
      showToast("Partner name is required.", "error");
      return;
    }

    if (formModal.mode === "add" && !logoFile) {
      showToast("Partner logo is required.", "error");
      return;
    }

    const newlyUploadedMedia: { publicId: string; resourceType: "image" | "video" }[] = [];

    startTransition(async () => {
      try {
        let logoMetadata = formModal.logo;

        // 1. Upload Logo if selected
        if (logoFile) {
          setUploadStatus("Uploading Logo (0%)...");
          const sig = await getUploadSignature("partners");
          const logoRes = await uploadFileWithProgress(logoFile, sig, "image", (p) => {
            setUploadStatus(`Uploading Logo (${p}%)...`);
          });
          newlyUploadedMedia.push({ publicId: logoRes.publicId, resourceType: "image" });
          logoMetadata = logoRes;
        }

        setUploadStatus("Saving...");

        const partnerPayload = {
          name: formModal.name.trim(),
          websiteUrl: formModal.websiteUrl.trim() || undefined,
          active: formModal.active,
          logo: logoMetadata!,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(partnerPayload));
        formData.append("newlyUploadedMedia", JSON.stringify(newlyUploadedMedia));

        if (formModal.mode === "add") {
          const res = await createPartner(formData);
          if (res.success) {
            showToast("Partner created successfully.");
            setFormModal({ isOpen: false, mode: "add", name: "", websiteUrl: "", active: true });
            window.location.reload();
          } else {
            showToast(res.error || "Failed to create partner.", "error");
          }
        } else {
          const res = await updatePartner(formModal.partnerId!, formData);
          if (res.success) {
            showToast("Partner updated successfully.");
            setFormModal({ isOpen: false, mode: "add", name: "", websiteUrl: "", active: true });
            window.location.reload();
          } else {
            showToast(res.error || "Failed to update partner.", "error");
          }
        }
      } catch (err) {
        console.error("Failed to save partner:", err);
        showToast(err instanceof Error ? err.message : "Failed to save partner.", "error");
      } finally {
        setUploadStatus(null);
      }
    });
  };

  const executeDelete = () => {
    const id = deleteModal.partnerId;
    setDeleteModal({ isOpen: false, partnerId: "", partnerName: "" });

    startTransition(async () => {
      const res = await deletePartner(id);
      if (res.success) {
        setPartners((prev) => prev.filter((p) => p._id !== id));
        showToast("Partner successfully deleted.");
      } else {
        showToast(res.error || "Failed to delete partner.", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
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

      {partners.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={openAddModal}
            className="inline-flex rounded-xl bg-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark"
          >
            Add Partner
          </button>
        </div>
      )}

      {/* Partners Cards Grid */}
      {partners.length === 0 ? (
        <div className="rounded-xl border border-dark/12 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto rounded-full bg-accent/10 p-4 text-accent w-16 h-16 flex items-center justify-center">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-md font-semibold text-dark">No Partners Uploaded</h3>
          <p className="mt-2 text-xs text-muted max-w-xs mx-auto">
            Add associate brand/client logos to present them on the home slider.
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 inline-flex rounded-xl bg-dark px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-accent hover:text-dark"
          >
            Add Partner
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {partners.map((partner) => (
            <div
              key={partner._id}
              className="rounded-xl border border-dark/12 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow transition"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${
                      partner.active
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    {partner.active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => handleToggleActive(partner._id, partner.active)}
                    className="text-[10px] font-semibold text-muted hover:text-dark uppercase tracking-wider"
                  >
                    Toggle
                  </button>
                </div>

                <div className="mt-4 flex h-24 items-center justify-center rounded-lg border border-dark/6 bg-secondary/35 p-4">
                  <img
                    src={partner.logo.url}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-dark truncate">
                  {partner.name}
                </h3>
                {partner.websiteUrl ? (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-accent block hover:underline truncate mt-0.5"
                  >
                    {partner.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className="text-[10px] text-muted/60 block mt-0.5">
                    No Website URL
                  </span>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-dark/6 pt-4">
                <button
                  onClick={() => openEditModal(partner)}
                  className="rounded-lg border border-dark/12 p-2 hover:bg-dark/5 text-muted/70 hover:text-dark transition"
                  title="Edit Partner"
                >
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-2.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => triggerDelete(partner._id, partner.name)}
                  className="rounded-lg border border-red-200 p-2 hover:bg-red-50 hover:text-red-700 text-red-600 transition"
                  title="Delete Partner"
                >
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog Modal */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <form
            onSubmit={handleFormSubmit}
            className="w-full max-w-md rounded-xl border border-dark/12 bg-white p-6 shadow-xl space-y-5"
          >
            <h3 className="text-lg font-semibold text-dark border-b border-dark/8 pb-3">
              {formModal.mode === "add" ? "Add Partner" : "Edit Partner"}
            </h3>

            {/* Logo Upload Field */}
            <div className="space-y-2">
              <span className="block text-sm font-semibold text-dark">
                Partner Logo
              </span>
              <div className="flex items-center gap-4">
                <div className="h-20 w-28 flex items-center justify-center rounded-lg border border-dark/12 bg-secondary/25 p-2 overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : formModal.logoUrl ? (
                    <img
                      src={formModal.logoUrl}
                      alt="Current logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-muted text-center leading-normal">
                      No Image Chosen
                    </span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-dark/12 bg-white px-3.5 py-2 text-xs font-semibold text-dark hover:bg-dark/5 transition"
                  >
                    Choose Image
                  </button>
                  <p className="mt-1 text-[10px] text-muted/80">
                    PNG, JPG, or WEBP (Max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Name Field */}
            <label className="grid gap-2 text-sm font-semibold text-dark">
              Partner Name
              <input
                type="text"
                required
                value={formModal.name}
                onChange={(e) =>
                  setFormModal((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-10 border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/65 focus:border-accent"
                placeholder="Partner company name"
              />
            </label>

            {/* Website URL Field */}
            <label className="grid gap-2 text-sm font-semibold text-dark">
              Website URL (Optional)
              <input
                type="url"
                value={formModal.websiteUrl}
                onChange={(e) =>
                  setFormModal((prev) => ({ ...prev, websiteUrl: e.target.value }))
                }
                className="h-10 border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/65 focus:border-accent"
                placeholder="https://example.com"
              />
            </label>

            {/* Active Toggle */}
            <div className="flex items-center justify-between border-t border-dark/6 pt-4">
              <span className="text-sm font-semibold text-dark">
                Activate Partner
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormModal((prev) => ({ ...prev, active: !prev.active }))
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formModal.active ? "bg-accent" : "bg-dark/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formModal.active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t border-dark/8 pt-4">
              <button
                type="button"
                onClick={() =>
                  setFormModal({ isOpen: false, mode: "add", name: "", websiteUrl: "", active: true })
                }
                className="rounded-xl border border-dark/12 bg-white px-4 py-2 text-xs font-semibold text-dark transition hover:bg-dark/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-dark px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-accent hover:text-dark disabled:opacity-50"
              >
                {isPending ? uploadStatus || "Saving..." : "Save Partner"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="w-full max-w-md rounded-xl border border-dark/12 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-dark">Confirm Deletion</h3>
            <p className="mt-3 text-sm text-muted">
              Are you sure you want to delete the partner{" "}
              <strong className="text-dark">&quot;{deleteModal.partnerName}&quot;</strong>? This will remove the logo from Cloudinary and delete the MongoDB document.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, partnerId: "", partnerName: "" })
                }
                className="rounded-xl border border-dark/12 bg-white px-4 py-2.5 text-xs font-semibold text-dark transition hover:bg-dark/5"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
