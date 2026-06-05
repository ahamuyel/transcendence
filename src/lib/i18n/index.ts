import pt from "./pt"
import en from "./en"
import es from "./es"
import fr from "./fr"

const translations: Record<string, Partial<typeof pt>> = { pt, en, es, fr }

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K }[keyof T & string]
  : never

export type TranslationKey = NestedKeyOf<typeof pt> | (string & {})

export const LOCALE_COOKIE = "cur10usx_locale"

export function getTranslation(locale: string = "pt") {
  return translations[locale] || translations.pt
}

export function t(locale: string, key: TranslationKey): string {
  const dict = getTranslation(locale)
  const parts = key.split(".")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = dict
  for (const part of parts) {
    value = value?.[part]
    if (value === undefined) return key
  }
  return typeof value === "string" ? value : key
}

export function tv(locale: string, key: TranslationKey): unknown {
  const dict = getTranslation(locale)
  const parts = key.split(".")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = dict
  for (const part of parts) {
    value = value?.[part]
    if (value === undefined) return key
  }
  return value
}

export function useTranslation(locale: string = "pt") {
  return {
    t: (key: TranslationKey) => t(locale, key),
    tv: (key: TranslationKey) => tv(locale, key),
    locale,
  }
}


