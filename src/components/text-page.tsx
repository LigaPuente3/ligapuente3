import { format } from "@/i18n/locale";

type Section = { title: string; paragraphs: string[] };

/** Página de texto (ayuda, privacidad, términos) con marcadores {site}, {contact}… ya sustituidos. */
export function TextPage({
  title,
  intro,
  sections,
  vars,
  footnote,
}: {
  title: string;
  intro: string;
  sections: Section[];
  vars: Record<string, string>;
  footnote?: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{format(title, vars)}</h1>
      <p className="mt-3 text-muted">{format(intro, vars)}</p>
      {sections.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="text-xl font-semibold">{format(section.title, vars)}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-relaxed break-words">
              {format(paragraph, vars)}
            </p>
          ))}
        </section>
      ))}
      {footnote ? <p className="mt-10 text-sm text-muted">{footnote}</p> : null}
    </article>
  );
}
