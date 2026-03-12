import en from "./en";
import he from "./he";

export type Locale = "en" | "he";

const dictionaries: Record<Locale, Record<string, string>> = { en, he };

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let text = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export const RTL_LOCALES: Locale[] = ["he"];
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
