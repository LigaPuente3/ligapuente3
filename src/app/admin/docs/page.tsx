import type { Metadata } from "next";
import { TextPage } from "@/components/text-page";
import { requirePermission } from "@/lib/session";
import { getDictionary, siteVars } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.admin.docs.title, robots: { index: false } };
}

export default async function AdminDocsPage() {
  await requirePermission("admin.access", "/admin/docs");
  const { dict } = await getDictionary();
  return (
    <TextPage
      title={dict.admin.docs.title}
      intro={dict.admin.docs.intro}
      sections={dict.admin.docs.sections}
      vars={siteVars(dict)}
    />
  );
}
