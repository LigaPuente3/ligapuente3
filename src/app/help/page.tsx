import type { Metadata } from "next";
import { TextPage } from "@/components/text-page";
import { getDictionary, siteVars } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.help.title };
}

export default async function HelpPage() {
  const { dict } = await getDictionary();
  return (
    <TextPage title={dict.help.title} intro={dict.help.intro} sections={dict.help.sections} vars={siteVars(dict)} />
  );
}
