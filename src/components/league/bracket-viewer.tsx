"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Texts = { open: string; close: string; fit: string; actual: string; title: string };

/**
 * Muestra el cuadro con desplazamiento horizontal (arranca centrado en la final) y, en el móvil,
 * un botón para verlo a pantalla completa, ajustado al ancho o a tamaño real.
 */
export function BracketViewer({ texts, children }: { texts: Texts; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const full = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(true);
  const [box, setBox] = useState<{ scale: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);

  const measure = () => {
    const el = content.current;
    if (!el) return;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    setBox({ scale: Math.min(1, (window.innerWidth - 32) / width), width, height });
  };

  useEffect(() => {
    if (!box) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [box]);

  const open = () => {
    setFit(true);
    dialog.current?.showModal();
    measure();
  };
  const scale = fit && box ? box.scale : 1;

  // A tamaño real, también arranca centrado en la final.
  useEffect(() => {
    const el = full.current;
    if (el && !fit) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, [fit]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="mt-3 min-h-11 w-full rounded-md border border-wood px-3 text-sm font-semibold text-wood-light hover:bg-wood/10 lg:hidden"
      >
        {texts.open}
      </button>
      <div ref={scroller} className="mt-3 overflow-x-auto pb-2">
        {children}
      </div>
      <dialog
        ref={dialog}
        aria-label={texts.title}
        onClose={() => setBox(null)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-text backdrop:bg-black/70"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2">
          <button
            type="button"
            onClick={() => setFit((f) => !f)}
            className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood"
          >
            {fit ? texts.actual : texts.fit}
          </button>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood"
          >
            {texts.close}
          </button>
        </div>
        <div ref={full} className="overflow-auto p-4">
          {/* Al ajustar, se reduce con transform y se reserva el tamaño reducido para que no sobre espacio. */}
          <div style={box ? { width: box.width * scale, height: box.height * scale } : undefined}>
            <div ref={content} className="w-max origin-top-left" style={{ transform: `scale(${scale})` }}>
              {children}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
