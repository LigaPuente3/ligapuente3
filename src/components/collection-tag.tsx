/** Etiqueta de la colección del torneo, solo texto (sin logos oficiales): «HMW · Homeworlds». */
export function CollectionTag({ code, name }: { code: string | null; name: string | null }) {
  if (!code && !name) return null;
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-wood px-2 py-0.5 text-xs">
      {code ? <span className="font-bold tracking-wide text-wood-light">{code}</span> : null}
      {code && name ? <span aria-hidden="true" className="text-muted">·</span> : null}
      {name ? <span className="truncate text-muted">{name}</span> : null}
    </span>
  );
}
