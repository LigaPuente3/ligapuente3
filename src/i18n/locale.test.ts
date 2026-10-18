import { describe, expect, it } from "vitest";
import { en } from "./en";
import { es } from "./es";
import { format, resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it("usa el idioma de la cookie si es válido", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("es")).toBe("es");
  });

  it("vuelve a español si no hay cookie o no es válida", () => {
    expect(resolveLocale(undefined)).toBe("es");
    expect(resolveLocale(null)).toBe("es");
    expect(resolveLocale("fr")).toBe("es");
  });
});

describe("format", () => {
  it("sustituye los marcadores y deja los desconocidos", () => {
    expect(format("Hola {name}, {missing}", { name: "Ana" })).toBe("Hola Ana, {missing}");
    expect(format("v{version}", { version: 3 })).toBe("v3");
  });
});

/** Rutas de todas las claves de texto (incluye índices de listas). */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

describe("diccionarios", () => {
  it("en tiene exactamente las mismas claves que es", () => {
    expect(keyPaths(en)).toEqual(keyPaths(es));
  });

  it("no hay textos vacíos", () => {
    const empty = (dict: object) => keyPaths(dict).filter((path) => {
      const text = path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], dict);
      return typeof text === "string" && text.trim() === "";
    });
    expect(empty(es)).toEqual([]);
    expect(empty(en)).toEqual([]);
  });
});
