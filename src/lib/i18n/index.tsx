"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/types";
import { dictionaries, type DictKey } from "./dictionaries";
import { useBirgeStore } from "@/lib/store";

export type TFunc = (key: DictKey, params?: Record<string, string | number>) => string;

interface I18nValue {
  locale: Locale;
  t: TFunc;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function translate(
  locale: Locale,
  key: DictKey,
  params?: Record<string, string | number>
): string {
  const template = dictionaries[locale][key] ?? dictionaries.ru[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m, name) =>
    params[name] !== undefined ? String(params[name]) : m
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useBirgeStore((s) => s.locale);
  const setLocale = useBirgeStore((s) => s.setLocale);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

// Localized field access for catalog entities (Spec §8: fall back to RU)
export function localized<T extends Record<string, unknown>>(
  obj: T,
  base: string,
  locale: Locale
): string {
  const suffix = locale === "ru" ? "Ru" : locale === "kk" ? "Kk" : "En";
  return (obj[`${base}${suffix}`] as string) ?? (obj[`${base}Ru`] as string) ?? "";
}
