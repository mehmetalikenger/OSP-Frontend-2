import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./locale";

// Loaded by the next-intl plugin (see next.config.ts). Resolves the active locale
// from the cookie and loads the matching message catalog for every request.
export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
