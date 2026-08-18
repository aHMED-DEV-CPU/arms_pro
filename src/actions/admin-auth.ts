"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAdmin(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    await signIn("credentials", {
      email: String(email),
      password: String(password),
      redirectTo: "/admin",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // Re-throw redirect errors so Next.js can perform the redirect
    if (
      error instanceof Error &&
      (error.constructor.name === "RedirectError" ||
        (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
    ) {
      throw error;
    }
    return { error: "Invalid email or password." };
  }
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/admin/login" });
}
