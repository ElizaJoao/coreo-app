import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const SUPPORTED_LOCALES = ["en", "pt", "es", "fr", "de"];
const LOCALE_COOKIE = "NEXT_LOCALE";

function detectLocale(acceptLanguage: string): string {
  const parts = acceptLanguage.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const part of parts) {
    const lang = part.split("-")[0];
    if (SUPPORTED_LOCALES.includes(lang)) return lang;
  }
  return "en";
}

export default auth(function middleware(request) {
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  const isValidLocale = cookieValue && SUPPORTED_LOCALES.includes(cookieValue);

  if (!isValidLocale) {
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const locale = detectLocale(acceptLanguage);
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/((?!forgot-password|reset-password|api|_next|.*\\..*).*)"],
};

