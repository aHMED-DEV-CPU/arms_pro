import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import dbConnect from "@/lib/db/mongoose";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        await dbConnect();
        const adminDoc = await Admin.findOne({ email }).lean();

        if (!adminDoc || !adminDoc.active) {
          return null;
        }

        const isValid = await bcrypt.compare(password, adminDoc.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(adminDoc._id),
          email: adminDoc.email,
          name: adminDoc.name || undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
});
