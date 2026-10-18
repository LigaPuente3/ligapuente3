import type { Metadata } from "next";
import { TextPage } from "@/components/text-page";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

/** Fecha de la última revisión del texto legal; actualízala al cambiarlo. */
const LAST_UPDATED = "2026-10-18";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.terms.title };
}

export default async function TermsPage() {
  const { dict } = await getDictionary();
  return (
    <TextPage
      title={dict.terms.title}
      intro={dict.terms.intro}
      sections={dict.terms.sections}
      vars={siteVars(dict)}
      footnote={format(dict.legal.lastUpdated, { date: LAST_UPDATED })}
    />
  );
}
