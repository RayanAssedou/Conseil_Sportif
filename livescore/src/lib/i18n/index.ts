import en from "./en";
import he from "./he";
import ar from "./ar";
import ru from "./ru";

export type Locale = "en" | "he" | "ar" | "ru";

const dictionaries: Record<Locale, Record<string, string>> = { en, he, ar, ru };

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let text = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export const RTL_LOCALES: Locale[] = ["he", "ar"];
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
