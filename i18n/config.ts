// Supported UI languages. `en` is the default/fallback.
export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Cookie that persists the user's language choice (read in i18n/request.ts).
export const LOCALE_COOKIE = "locale";
