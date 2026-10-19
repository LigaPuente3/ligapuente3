import { describe, expect, it } from "vitest";
import { managedAchievementTypes, parseAchievements, parseCount, sortAchievements } from "./achievements";

describe("parseAchievements", () => {
  it("lee las veces de cada logro e ignora los vacíos y los ceros", () => {
    expect(parseAchievements({ achievement_PQ: "2", achievement_SECTOR: "", achievement_REGIONAL: "0" })).toEqual([
      { type: "PQ", count: 2 },
    ]);
  });

  it("el jugador no puede marcarse la Liga Puente 3 desde su perfil", () => {
    expect(parseAchievements({ achievement_PQ: "1", achievement_LIGA_PUENTE3: "3" })).toEqual([{ type: "PQ", count: 1 }]);
  });

  it("los moderadores sí pueden asignar la Liga Puente 3", () => {
    expect(parseAchievements({ achievement_LIGA_PUENTE3: "3" }, managedAchievementTypes)).toEqual([
      { type: "LIGA_PUENTE3", count: 3 },
    ]);
  });

  it("rechaza valores no numéricos, negativos o mayores de 99", () => {
    expect(parseAchievements({ achievement_PQ: "dos" })).toBeNull();
    expect(parseAchievements({ achievement_PQ: "-1" })).toBeNull();
    expect(parseAchievements({ achievement_PQ: "100" })).toBeNull();
  });

  it("devuelve una lista vacía si no hay logros", () => {
    expect(parseAchievements({})).toEqual([]);
  });
});

describe("parseCount", () => {
  it("vacío es 0 y solo admite enteros de 0 a 99", () => {
    expect(parseCount("")).toBe(0);
    expect(parseCount(" 7 ")).toBe(7);
    expect(parseCount("1.5")).toBeNull();
    expect(parseCount("100")).toBeNull();
  });
});

describe("sortAchievements", () => {
  it("ordena por importancia: Galactic, Regional, Sector, PQ y Liga Puente 3", () => {
    const sorted = sortAchievements([
      { type: "LIGA_PUENTE3" as const },
      { type: "PQ" as const },
      { type: "GALACTIC" as const },
    ]);
    expect(sorted.map((a) => a.type)).toEqual(["GALACTIC", "PQ", "LIGA_PUENTE3"]);
  });
});
