import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/** Estilos de cada elemento (no se permite HTML dentro del texto: react-markdown lo ignora). */
const components: Components = {
  h1: ({ children }) => <h2 className="mt-8 text-2xl font-bold text-wood-light first:mt-0">{children}</h2>,
  h2: ({ children }) => <h3 className="mt-8 text-xl font-semibold text-wood-light">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-6 text-lg font-semibold">{children}</h4>,
  p: ({ children }) => <p className="mt-3 leading-relaxed break-words">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-6">{children}</ol>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="break-words text-wood-light underline hover:text-text">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="rounded bg-surface-2 px-1 py-0.5 text-sm break-words">{children}</code>,
  pre: ({ children }) => <pre className="mt-3 overflow-x-auto rounded-md bg-surface-2 p-3 text-sm">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="mt-3 border-l-4 border-wood pl-4 text-muted">{children}</blockquote>,
  table: ({ children }) => (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-border px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-border px-2 py-1 align-top">{children}</td>,
};

export function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </ReactMarkdown>
  );
}
