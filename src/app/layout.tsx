import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";
import { site } from "@/lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: format(dict.meta.description, siteVars(dict)),
    icons: { icon: "/brand/puente3-logo.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0b09",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dict } = await getDictionary();

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-wood focus:px-3 focus:py-2 focus:text-bg"
        >
          {dict.nav.skipToContent}
        </a>
        <SiteHeader locale={locale} dict={dict} />
        <main id="contenido" className="w-full flex-1">
          {children}
        </main>
        <SiteFooter dict={dict} />
      </body>
    </html>
  );
}
