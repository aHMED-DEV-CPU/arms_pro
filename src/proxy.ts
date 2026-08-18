import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = nextUrl.pathname === "/admin/login";

  if (isAdminRoute) {
    if (isLoginRoute) {
      if (isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl));
      }
      return;
    }
    if (!isLoggedIn) {
      return Response.redirect(new URL("/admin/login", nextUrl));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
