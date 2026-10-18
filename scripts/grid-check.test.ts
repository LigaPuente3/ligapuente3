import { describe, expect, it } from "vitest";
import { findMissingBaseGrid } from "./grid-check.mjs";

describe("findMissingBaseGrid", () => {
  it("acepta rejillas con columna base", () => {
    expect(findMissingBaseGrid(`<ul className="grid grid-cols-1 sm:grid-cols-3" />`)).toEqual([]);
  });

  it("detecta columnas solo en breakpoints", () => {
    const problems = findMissingBaseGrid(`a\n<div className="grid gap-2 md:grid-cols-2" />`);
    expect(problems).toEqual([{ line: 2, text: "grid gap-2 md:grid-cols-2" }]);
  });

  it("detecta variantes encadenadas y valores arbitrarios", () => {
    expect(findMissingBaseGrid(`cls = 'grid hover:lg:grid-cols-[1fr_2fr]'`)).toHaveLength(1);
  });

  it("revisa plantillas y cada literal por separado", () => {
    const source = "const a = `grid grid-cols-2`; const b = `grid xl:grid-cols-4`;";
    expect(findMissingBaseGrid(source)).toHaveLength(1);
  });

  it("ignora textos sin rejilla responsive", () => {
    expect(findMissingBaseGrid(`"grid grid-cols-2" 'flex sm:flex-row'`)).toEqual([]);
  });
});
