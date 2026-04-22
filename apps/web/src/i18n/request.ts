import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const SUPPORTED_LOCALES = ["en", "pt", "es", "fr", "de"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function detectLocaleFromAcceptLanguage(acceptLanguage: string): Locale {
  const parts = acceptLanguage.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const part of parts) {
    const lang = part.split("-")[0];
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) return lang as Locale;
  }
  return "en";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale: Locale = "en";
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale as Locale;
  } else {
    const acceptLanguage = headersList.get("accept-language") ?? "";
    locale = detectLocaleFromAcceptLanguage(acceptLanguage);
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
