import { describe, expect, it } from "vitest";
import {
  adjacentTier,
  canReportResult,
  computeStandings,
  drawGroups,
  pairsForNewMember,
  parseResult,
  roundRobinPairs,
  seededRandom,
  shuffle,
  playerReportToScore,
  zoneFor,
  type MatchForStandings,
} from "./league";

const played = (a: string | null, b: string | null, gamesA: number, gamesB: number): MatchForStandings => ({
  playerAId: a,
  playerBId: b,
  status: "PLAYED",
  gamesA,
  gamesB,
});

describe("sorteo", () => {
  it("baraja sin perder ni repetir jugadores y es reproducible con semilla", () => {
    const players = ["a", "b", "c", "d", "e", "f"];
    const first = shuffle(players, seededRandom(42));
    expect([...first].sort()).toEqual(players);
    expect(shuffle(players, seededRandom(42))).toEqual(first);
    expect(players).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("reparte en grupos equilibrados (diferencia máxima de 1)", () => {
    const players = Array.from({ length: 17 }, (_, i) => `p${i}`);
    const groups = drawGroups(players, 3, seededRandom(1));
    expect(groups.map((g) => g.length).sort()).toEqual([5, 6, 6]);
    expect(groups.flat().sort()).toEqual([...players].sort());
  });

  it("no permite más grupos que jugadores ni menos de 1", () => {
    expect(() => drawGroups(["a"], 2)).toThrow();
    expect(() => drawGroups(["a", "b"], 0)).toThrow();
  });
});

describe("cruces", () => {
  it("todos contra todos: n·(n-1)/2 partidos sin repetir", () => {
    const pairs = roundRobinPairs(["a", "b", "c", "d"]);
    expect(pairs).toHaveLength(6);
    const keys = pairs.map(([x, y]) => [x, y].sort().join("-"));
    expect(new Set(keys).size).toBe(6);
  });

  it("quien entra tarde juega contra todos los que ya estaban", () => {
    expect(pairsForNewMember("z", ["a", "b"])).toEqual([
      ["a", "z"],
      ["b", "z"],
    ]);
  });
});

describe("resultados", () => {
  it("acepta los resultados posibles al mejor de 3", () => {
    expect(parseResult("2-1")).toEqual({ gamesA: 2, gamesB: 1 });
    // Sin empates: el 1-1 no es un resultado válido.
    expect(parseResult("1-1")).toBeNull();
    expect(parseResult("3-0")).toBeNull();
    expect(parseResult("2-2")).toBeNull();
  });

  it("el jugador anota sus juegos y los del rival, y se guarda en su lado", () => {
    expect(playerReportToScore("2", "1", true)).toEqual({ gamesA: 2, gamesB: 1 });
    expect(playerReportToScore("2", "0", false)).toEqual({ gamesA: 0, gamesB: 2 });
    // También puede anotarlo quien pierde.
    expect(playerReportToScore("1", "2", true)).toEqual({ gamesA: 1, gamesB: 2 });
    expect(playerReportToScore("0", "2", false)).toEqual({ gamesA: 2, gamesB: 0 });
  });

  it("solo acepta partidos terminados al mejor de 3", () => {
    expect(playerReportToScore("1", "1", true)).toBeNull();
    expect(playerReportToScore("2", "2", true)).toBeNull();
    expect(playerReportToScore("0", "0", true)).toBeNull();
    expect(playerReportToScore("3", "0", true)).toBeNull();
    expect(playerReportToScore("", "2", true)).toBeNull();
    expect(playerReportToScore(null, "2", true)).toBeNull();
  });

  it("solo informan los jugadores del partido, con el torneo en juego y el partido pendiente", () => {
    const match = { status: "PENDING", playerAId: "a", playerBId: "b" };
    expect(canReportResult(match, "a", "IN_PROGRESS")).toBe("A");
    expect(canReportResult(match, "b", "IN_PROGRESS")).toBe("B");
    expect(canReportResult(match, "c", "IN_PROGRESS")).toBeNull();
    expect(canReportResult(match, "a", "PUBLISHED")).toBeNull();
    expect(canReportResult({ ...match, status: "PLAYED" }, "a", "IN_PROGRESS")).toBeNull();
  });
});

describe("clasificación", () => {
  it("3 puntos por victoria y cuenta partidos y juegos", () => {
    const rows = computeStandings(["a", "b", "c"], [played("a", "b", 2, 0), played("b", "c", 2, 1)]);
    expect(rows.map((r) => [r.playerId, r.position, r.points, r.played, r.gamesWon, r.gamesLost])).toEqual([
      ["a", 1, 3, 1, 2, 0],
      ["b", 2, 3, 2, 2, 3],
      ["c", 3, 0, 1, 1, 2],
    ]);
  });

  it("ignora los partidos pendientes y los no jugados", () => {
    const rows = computeStandings(
      ["a", "b"],
      [
        { playerAId: "a", playerBId: "b", status: "PENDING", gamesA: null, gamesB: null },
        { playerAId: "a", playerBId: "b", status: "NOT_PLAYED", gamesA: null, gamesB: null },
      ],
    );
    expect(rows.every((r) => r.played === 0 && r.points === 0)).toBe(true);
  });

  it("el empate 1-1 da 1 punto a cada uno", () => {
    const rows = computeStandings(["a", "b"], [played("a", "b", 1, 1)]);
    expect(rows.map((r) => [r.points, r.drawn])).toEqual([
      [1, 1],
      [1, 1],
    ]);
  });

  it("primer desempate: juegos ganados; segundo: enfrentamiento directo", () => {
    // a: gana a c 2-1 → 3 pts, 2 juegos.  b: gana a d 2-0 y pierde con c 1-2 → 3 pts, 3 juegos.
    // c: pierde con a 1-2 y gana a b 2-1 → 3 pts, 3 juegos.  d: 0 pts.
    // b y c empatan a puntos y juegos ganados; c ganó a b → c primero. a, tercero por juegos ganados.
    const rows = computeStandings(
      ["a", "b", "c", "d"],
      [played("a", "c", 2, 1), played("b", "d", 2, 0), played("c", "b", 2, 1)],
    );
    expect(rows.map((r) => r.playerId)).toEqual(["c", "b", "a", "d"]);
  });

  it("tercer desempate: diferencia de juegos (si no se han enfrentado)", () => {
    // x: gana a c 2-1 (3 pts, 2 juegos, diferencia +1). y: gana a d 2-0 (3 pts, 2 juegos, +2).
    // No se han enfrentado → decide la diferencia de juegos: y primero.
    const rows = computeStandings(["x", "y", "c", "d"], [played("x", "c", 2, 1), played("y", "d", 2, 0)]);
    expect(rows.map((r) => r.playerId)).toEqual(["y", "x", "c", "d"]);
  });

  it("triple empate total: se mantiene el orden recibido", () => {
    // Cada uno gana uno 2-0 y pierde otro 0-2: mismos puntos, juegos, directo y diferencia.
    const rows = computeStandings(["a", "b", "c"], [played("b", "a", 2, 0), played("c", "b", 2, 0), played("a", "c", 2, 0)]);
    expect(rows.map((r) => [r.playerId, r.position])).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
  });

  it("si un jugador borró su cuenta, sus partidos siguen contando para el rival", () => {
    const rows = computeStandings(["a"], [played("a", null, 2, 0), played(null, "a", 2, 1)]);
    expect(rows[0]).toMatchObject({ played: 2, won: 1, lost: 1, points: 3, gamesWon: 3, gamesLost: 2 });
  });
});

describe("zonas de ascenso y descenso", () => {
  it("orden de divisiones: Legendaria, Rara, Infrecuente, Común", () => {
    expect(adjacentTier("RARE", "up")).toBe("LEGENDARY");
    expect(adjacentTier("RARE", "down")).toBe("UNCOMMON");
    expect(adjacentTier("LEGENDARY", "up")).toBeNull();
    expect(adjacentTier("COMMON", "down")).toBeNull();
  });

  it("en Rara el primero sube a Legendaria y el último baja a Infrecuente", () => {
    expect(zoneFor("RARE", 1, 5, 1, 1)).toEqual({ kind: "promotion", to: "LEGENDARY" });
    expect(zoneFor("RARE", 3, 5, 1, 1)).toBeNull();
    expect(zoneFor("RARE", 5, 5, 1, 1)).toEqual({ kind: "relegation", to: "UNCOMMON" });
  });

  it("en Legendaria el primero es el campeón (dorado) y el último baja a Rara", () => {
    expect(zoneFor("LEGENDARY", 1, 5, 1, 1)).toEqual({ kind: "champion" });
    expect(zoneFor("LEGENDARY", 2, 5, 1, 1)).toBeNull();
    expect(zoneFor("LEGENDARY", 5, 5, 1, 1)).toEqual({ kind: "relegation", to: "RARE" });
  });

  it("en Común el primero sube a Infrecuente y nadie baja", () => {
    expect(zoneFor("COMMON", 1, 4, 1, 1)).toEqual({ kind: "promotion", to: "UNCOMMON" });
    expect(zoneFor("COMMON", 4, 4, 1, 1)).toBeNull();
  });

  it("respeta el número de ascensos y descensos del torneo", () => {
    expect(zoneFor("UNCOMMON", 2, 6, 2, 2)).toEqual({ kind: "promotion", to: "RARE" });
    expect(zoneFor("UNCOMMON", 5, 6, 2, 2)).toEqual({ kind: "relegation", to: "COMMON" });
    expect(zoneFor("UNCOMMON", 3, 6, 0, 0)).toBeNull();
    expect(zoneFor("UNCOMMON", 1, 6, 0, 0)).toBeNull();
  });

  it("en grupos pequeños el ascenso no se pisa con el descenso", () => {
    // Grupo de 2 con 1 y 1: el primero sube y el segundo baja.
    expect(zoneFor("RARE", 1, 2, 1, 1)).toEqual({ kind: "promotion", to: "LEGENDARY" });
    expect(zoneFor("RARE", 2, 2, 1, 1)).toEqual({ kind: "relegation", to: "UNCOMMON" });
    // Grupo de 2 con 2 ascensos: los dos suben, nadie baja.
    expect(zoneFor("RARE", 2, 2, 2, 1)).toEqual({ kind: "promotion", to: "LEGENDARY" });
  });
});
