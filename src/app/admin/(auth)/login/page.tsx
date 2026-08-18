"use client";

import { useActionState } from "react";
import { Container } from "@/components/ui/Container";
import { loginAdmin } from "@/actions/admin-auth";

const inputClass =
  "h-12 w-full border-0 border-b border-dark/18 bg-transparent px-0 font-normal text-text outline-none transition placeholder:text-muted/60 focus:border-accent";
const errorClass = "text-sm font-medium text-red-700";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <main className="flex min-h-screen items-center py-20 bg-secondary">
      <Container className="max-w-md">
        <div className="rounded-xl border border-dark/12 bg-white/45 p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            ARMS PRO
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-dark">Admin Login</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to access the administrator panel.
          </p>

          <form action={formAction} className="mt-8 space-y-6" noValidate>
            <label className="grid gap-2 text-sm font-semibold text-dark">
              Email Address
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                className={inputClass}
                placeholder="email@example.com"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-dark">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className={inputClass}
                placeholder="••••••••"
              />
            </label>

            {state?.error ? (
              <p className={errorClass} role="alert">
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex justify-center rounded-xl bg-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-dark disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
