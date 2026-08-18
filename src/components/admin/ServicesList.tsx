"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  deleteService,
  reorderServices,
  toggleServiceFeatured,
  toggleServiceStatus,
} from "@/actions/admin/services";

interface ServiceItem {
  _id: string;
  name: { en: string; ar?: string };
  slug: string;
  coverImage: { url: string; publicId: string };
  status: "draft" | "published";
  featured: boolean;
  displayOrder: number;
}

interface ServicesListProps {
  initialServices: ServiceItem[];
}

export function ServicesList({ initialServices }: ServicesListProps) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const toastTimerRef = useRef<number | null>(null);

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    serviceId: string;
    serviceName: string;
  }>({ isOpen: false, serviceId: "", serviceName: "" });

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

  // DND Kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Don't trigger drag on simple clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = services.findIndex((item) => item._id === active.id);
    const newIndex = services.findIndex((item) => item._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Save previous state for rollback on error
    const previousServices = [...services];

    // Compute optimistic list order
    const reorderedList = arrayMove(services, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    // Immediately update local optimistic state
    setServices(reorderedList);

    const ids = reorderedList.map((item) => item._id);

    startTransition(async () => {
      const res = await reorderServices(ids);
      if (res.success) {
        showToast("Display order updated and saved.");
      } else {
        showToast(res.error || "Failed to update display order.", "error");
        // Rollback state on failure
        setServices(previousServices);
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: "draft" | "published") => {
    const newStatus = currentStatus === "draft" ? "published" : "draft";
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
    );

    startTransition(async () => {
      const res = await toggleServiceStatus(id, newStatus);
      if (res.success) {
        showToast(`Service status updated to ${newStatus}.`);
      } else {
        showToast("Failed to update status.", "error");
        // Revert
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: currentStatus } : s))
        );
      }
    });
  };

  const handleToggleFeatured = (id: string, currentFeatured: boolean) => {
    const newFeatured = !currentFeatured;
    setServices((prev) =>
      prev.map((s) => (s._id === id ? { ...s, featured: newFeatured } : s))
    );

    startTransition(async () => {
      const res = await toggleServiceFeatured(id, newFeatured);
      if (res.success) {
        showToast(
          newFeatured ? "Service set as featured." : "Service unfeatured."
        );
      } else {
        showToast("Failed to toggle featured status.", "error");
        // Revert
        setServices((prev) =>
          prev.map((s) => (s._id === id ? { ...s, featured: currentFeatured } : s))
        );
      }
    });
  };

  const triggerDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, serviceId: id, serviceName: name });
  };

  const executeDelete = () => {
    const id = deleteModal.serviceId;
    setDeleteModal({ isOpen: false, serviceId: "", serviceName: "" });

    startTransition(async () => {
      const res = await deleteService(id);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s._id !== id));
        if (res.warning) {
          showToast(res.warning, "success");
        } else {
          showToast("Service successfully deleted.");
        }
      } else {
        showToast(res.error || "Failed to delete service.", "error");
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

      {/* Services List Card */}
      <div className={`rounded-xl border border-dark/12 bg-white shadow-sm overflow-hidden transition-opacity ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-accent/10 p-4 text-accent">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-4 text-md font-semibold text-dark">No Services Found</h3>
            <p className="mt-2 text-xs text-muted max-w-xs">
              Create your first service offering to display it in the public catalog.
            </p>
            <Link
              href="/admin/services/new"
              className="mt-5 inline-flex rounded-xl bg-dark px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent hover:text-dark"
            >
              Add Service
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark/8">
            {/* Header row (Desktop) */}
            <div className="hidden grid-cols-12 items-center gap-4 bg-black/5 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted md:grid">
              <div className="col-span-1">Reorder</div>
              <div className="col-span-2">Cover</div>
              <div className="col-span-3">English Name</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Featured</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={services.map((s) => s._id)}
                strategy={verticalListSortingStrategy}
              >
                {services.map((service) => (
                  <SortableServiceRow
                    key={service._id}
                    service={service}
                    onToggleStatus={handleToggleStatus}
                    onToggleFeatured={handleToggleFeatured}
                    onDelete={triggerDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="w-full max-w-md rounded-xl border border-dark/12 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-dark">Confirm Deletion</h3>
            <p className="mt-3 text-sm text-muted">
              Are you sure you want to delete the service{" "}
              <strong className="text-dark">&quot;{deleteModal.serviceName}&quot;</strong>? This will permanently delete the service details and all associated Cloudinary images/videos.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, serviceId: "", serviceName: "" })
                }
                className="rounded-xl border border-dark/12 bg-white px-4 py-2.5 text-xs font-semibold text-dark transition hover:bg-dark/5"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableServiceRow({
  service,
  onToggleStatus,
  onToggleFeatured,
  onDelete,
}: {
  service: ServiceItem;
  onToggleStatus: (id: string, status: "draft" | "published") => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-4 transition hover:bg-black/2 bg-white ${
        isDragging ? "shadow-md rounded-lg" : ""
      }`}
    >
      {/* Drag handle */}
      <div className="col-span-1 flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted/60 hover:text-dark p-1"
          title="Drag to reorder"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <span className="text-xs font-medium text-muted/65 md:hidden">Position: {service.displayOrder}</span>
      </div>

      {/* Cover Image */}
      <div className="col-span-2">
        <img
          src={service.coverImage.url}
          alt={service.name.en}
          className="h-12 w-20 object-cover rounded-lg border border-dark/8"
        />
      </div>

      {/* English Name */}
      <div className="col-span-3">
        <h4 className="text-sm font-semibold text-dark truncate">
          {service.name.en}
        </h4>
        <span className="text-[10px] font-mono text-muted/80 block mt-0.5">
          /{service.slug}
        </span>
      </div>

      {/* Status Badge */}
      <div className="col-span-2 flex justify-start md:justify-center">
        <button
          onClick={() => onToggleStatus(service._id, service.status)}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold transition border ${
            service.status === "published"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
          }`}
        >
          {service.status === "published" ? "Published" : "Draft"}
        </button>
      </div>

      {/* Featured Checkbox/Star */}
      <div className="col-span-2 flex justify-start md:justify-center">
        <button
          onClick={() => onToggleFeatured(service._id, service.featured)}
          className={`p-1.5 rounded-lg border transition ${
            service.featured
              ? "bg-accent/15 border-accent/30 text-accent"
              : "bg-white border-dark/12 text-muted/40 hover:text-accent"
          }`}
          title={service.featured ? "Featured item" : "Set as featured"}
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex justify-end gap-3 text-right">
        <Link
          href={`/admin/services/${service._id}`}
          className="rounded-lg border border-dark/12 p-2 hover:bg-dark/5 hover:text-dark text-muted/70 transition"
          title="Edit"
        >
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-2.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </Link>
        <button
          onClick={() => onDelete(service._id, service.name.en)}
          className="rounded-lg border border-red-200 p-2 hover:bg-red-50 hover:text-red-700 text-red-600 transition"
          title="Delete"
        >
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
