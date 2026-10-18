import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { site } from "@/lib/site";
import { en } from "./en";
import { es, type Dictionary } from "./es";
import { format, localeCookieName, resolveLocale, type Locale } from "./locale";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  return resolveLocale(store.get(localeCookieName)?.value);
});

export const getDictionary = cache(async () => {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
});

/** Valores de los marcadores comunes ({site}, {community}, {contact}, {controller}). */
export function siteVars(dict: Dictionary): Record<string, string> {
  const vars = { site: site.name, community: site.communityName };
  return {
    ...vars,
    contact: site.contactEmail ?? format(dict.legal.contactFallback, vars),
    controller: site.legalControllerName ?? format(dict.legal.controllerFallback, vars),
  };
}
