import { useContext } from "react"
import { LocaleContext } from "@/provider/locale"
import pt from "./pt"
import en from "./en"
import es from "./es"
import fr from "./fr"

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

const translations: Record<string, DeepPartial<typeof pt>> = { pt, en, es, fr }

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

export function useTranslation(locale?: string) {
  let activeLocale = locale
  if (!activeLocale) {
    try {
      activeLocale = useContext(LocaleContext) || "pt"
    } catch {
      activeLocale = "pt"
    }
  }
  return {
    t: (key: TranslationKey) => t(activeLocale!, key),
    tv: (key: TranslationKey) => tv(activeLocale!, key),
    locale: activeLocale!,
  }
}



