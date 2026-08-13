"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/contact";

const inputClass =
  "h-12 border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent";
const errorClass = "text-sm font-medium text-red-700";

export function ContactForm() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setStatusMessage(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as { message?: string };

    setStatusMessage(
      result.message ??
        "Email delivery is not configured yet. Please contact INFO@SWAED.COM.SA directly.",
    );
  }

  return (
    <form
      className="rounded-xl border border-dark/12 bg-white/45 p-6 sm:p-8"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          error={errors.name?.message}
          input={
            <input
              type="text"
              autoComplete="name"
              className={inputClass}
              placeholder="Name"
              {...register("name")}
            />
          }
        />
        <Field
          label="Email"
          error={errors.email?.message}
          input={
            <input
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="Email"
              {...register("email")}
            />
          }
        />
        <Field
          label="Phone"
          error={errors.phone?.message}
          input={
            <input
              type="tel"
              autoComplete="tel"
              className={inputClass}
              placeholder="Phone"
              {...register("phone")}
            />
          }
        />
        <Field
          label="Subject"
          error={errors.subject?.message}
          input={
            <input
              type="text"
              className={inputClass}
              placeholder="Subject"
              {...register("subject")}
            />
          }
        />
      </div>
      <Field
        label="Message"
        error={errors.message?.message}
        className="mt-5"
        input={
          <textarea
            rows={6}
            className="resize-none border-0 border-b border-dark/18 bg-transparent px-0 py-3 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent"
            placeholder="Message"
            {...register("message")}
          />
        }
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isSubmitting ? "Checking..." : "Submit"}
      </button>
      {statusMessage ? (
        <p className="mt-4 rounded-lg border border-accent/35 bg-accent/10 px-4 py-3 text-sm leading-6 text-dark">
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}

type FieldProps = {
  label: string;
  input: ReactNode;
  error?: string;
  className?: string;
};

function Field({ label, input, error, className = "" }: FieldProps) {
  return (
    <label className={`grid gap-2 text-sm font-semibold text-dark ${className}`}>
      {label}
      {input}
      {error ? <span className={errorClass}>{error}</span> : null}
    </label>
  );
}
