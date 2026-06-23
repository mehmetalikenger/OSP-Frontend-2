"use server";

// Read/write the active locale from a cookie. This is the "without i18n routing"
// setup from next-intl: the language lives in a cookie instead of the URL, so the
// existing route groups (and the custom proxy.ts) don't need to change.
import { cookies, headers } from "next/headers";
import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from "./config";

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

// Primary subtags that should be treated as German even though they aren't
// "de-*": Swiss German (gsw) and Low German (nds) carry their own ISO codes,
// so e.g. a "gsw" browser still gets the German UI.
const GERMAN_ALIASES: Record<string, Locale> = {
  gsw: "de",
  nds: "de",
};

// Resolve a single primary subtag (e.g. "de", "gsw") to a supported locale.
function resolveSubtag(subtag: string): Locale | undefined {
  if (isLocale(subtag)) return subtag;
  return GERMAN_ALIASES[subtag];
}

// Pick the best supported locale from the browser's Accept-Language header.
// e.g. "de-DE,de;q=0.9,en-US;q=0.8" -> "de"
function matchAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.split("=")[1]) : 1;
      // Compare on the primary subtag only: "de-DE" / "de-AT" / "de-CH" -> "de".
      return { lang: tag.toLowerCase().split("-")[0], q: Number.isNaN(q) ? 0 : q };
    })
    .filter((entry) => entry.lang)
    .sort((a, b) => b.q - a.q);

  for (const entry of ranked) {
    const locale = resolveSubtag(entry.lang);
    if (locale) return locale;
  }
  return defaultLocale;
}

export async function getUserLocale(): Promise<Locale> {
  // 1. An explicit choice (the cookie set by the language button) always wins.
  const cookieValue = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  // 2. First visit / no choice yet: auto-detect from the browser's languages.
  const acceptLanguage = (await headers()).get("accept-language");
  return matchAcceptLanguage(acceptLanguage);
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
