import { describe, expect, it } from "vitest";
import {
  assignLosers,
  buildBracket,
  resolveBracket,
  seedOrder,
  type BracketDef,
  type GroupStanding,
  type StoredResult,
} from "./bracket";

/** Grupo con jugadores «g{grupo}p{puesto}», ordenados de 1.º a último, con puntos decrecientes. */
function group(n: number, size: number, bonus = 0): GroupStanding {
  return {
    group: n,
    rows: Array.from({ length: size }, (_, i) => ({
      playerId: `g${n}p${i + 1}`,
      points: (size - i) * 3 + bonus,
      gamesWon: (size - i) * 2 + bonus,
      gamesLost: i,
    })),
  };
}

/** Juega todos los partidos listos: gana siempre el jugador indicado por `pick` (A por defecto) 2-1. */
function playAll(def: BracketDef, pick: (code: string, a: string, b: string) => "A" | "B" = () => "A") {
  const stored: Record<string, StoredResult> = {};
  for (let guard = 0; guard < 50; guard++) {
    const { matches } = resolveBracket(def, stored);
    const ready = matches.filter((m) => m.status === "ready");
    if (ready.length === 0) break;
    for (const m of ready) {
      if (m.playerA.state !== "known" || m.playerB.state !== "known") continue;
      const aWins = pick(m.code, m.playerA.id, m.playerB.id) === "A";
      stored[m.code] = { playerAId: m.playerA.id, playerBId: m.playerB.id, gamesA: aWins ? 2 : 1, gamesB: aWins ? 1 : 2 };
    }
  }
  return { stored, result: resolveBracket(def, stored) };
}

const byCode = (def: BracketDef) => Object.fromEntries(def.matches.map((m) => [m.code, m]));

describe("orden de cabezas de serie", () => {
  it("el 1 y el 2 solo pueden cruzarse en la final", () => {
    expect(seedOrder(4)).toEqual([1, 4, 2, 3]);
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });
});

describe("un solo grupo", () => {
  it("con 4 o más: semifinales 1.º-4.º y 2.º-3.º y final", () => {
    const def = buildBracket([group(1, 6)]);
    expect(def.format).toBe("single");
    const m = byCode(def);
    expect(m.S1?.a).toEqual({ kind: "seed", playerId: "g1p1" });
    expect(m.S1?.b).toEqual({ kind: "seed", playerId: "g1p4" });
    expect(m.S2?.a).toEqual({ kind: "seed", playerId: "g1p2" });
    expect(m.S2?.b).toEqual({ kind: "seed", playerId: "g1p3" });
    const { result } = playAll(def);
    expect(result.champion).toBe("g1p1");
  });

  it("con 2 o 3: final directa 1.º-2.º", () => {
    const def = buildBracket([group(1, 3)]);
    expect(def.matches.map((m) => m.code)).toEqual(["FINAL"]);
    const { result } = playAll(def, () => "B");
    expect(result.champion).toBe("g1p2");
  });
});

describe("dos grupos: el cuadro de la V edición (A–H)", () => {
  const def = buildBracket([group(1, 5), group(2, 5, 1)]);
  const m = byCode(def);

  it("letras y cruces como en el cuadro: A y B, C y D, E, F, G y H", () => {
    expect(def.format).toBe("double");
    expect(Object.fromEntries(def.matches.map((x) => [x.code, x.label]))).toEqual({
      "W1-1": "A",
      "W1-2": "B",
      "L1-1": "C",
      "L1-2": "D",
      "W2-1": "E",
      "L2-1": "F",
      "L3-1": "G",
      GF: "H",
      GF2: "H2",
    });
    // El mejor 1.º (grupo 2, por puntos) contra el 2.º del otro grupo, y al revés.
    expect([m["W1-1"]?.a, m["W1-1"]?.b]).toEqual([
      { kind: "seed", playerId: "g2p1" },
      { kind: "seed", playerId: "g1p2" },
    ]);
    expect([m["W1-2"]?.a, m["W1-2"]?.b]).toEqual([
      { kind: "seed", playerId: "g1p1" },
      { kind: "seed", playerId: "g2p2" },
    ]);
    expect(def.thirds.sort()).toEqual(["g1p3", "g2p3"]);
  });

  it("los 3.º están colocados desde el principio (el mejor en C) y esperan rival", () => {
    const r = Object.fromEntries(resolveBracket(def, {}).matches.map((x) => [x.code, x]));
    expect(r["L1-1"]?.playerB).toEqual({ state: "known", id: "g2p3" });
    expect(r["L1-2"]?.playerB).toEqual({ state: "known", id: "g1p3" });
    expect(r["L1-1"]?.playerA).toEqual({ state: "pending" });
    expect(r["L1-1"]?.status).toBe("waiting");
  });

  it("cada perdedor de la primera ronda juega contra el 3.º de otro grupo", () => {
    // Pierden los 1.º en A y B: g2p1 (grupo 2) y g1p1 (grupo 1).
    const stored: Record<string, StoredResult> = {
      "W1-1": { playerAId: "g2p1", playerBId: "g1p2", gamesA: 0, gamesB: 2 },
      "W1-2": { playerAId: "g1p1", playerBId: "g2p2", gamesA: 1, gamesB: 2 },
    };
    const r = Object.fromEntries(resolveBracket(def, stored).matches.map((x) => [x.code, x]));
    // Los 3.º no se mueven: g2p1 (grupo 2) va a D, donde espera el 3.º del grupo 1, y g1p1 a C.
    expect(r["L1-1"]?.playerA).toEqual({ state: "known", id: "g1p1" });
    expect(r["L1-1"]?.playerB).toEqual({ state: "known", id: "g2p3" });
    expect(r["L1-1"]?.fromMatch).toBe("W1-2");
    expect(r["L1-2"]?.playerA).toEqual({ state: "known", id: "g2p1" });
    expect(r["L1-2"]?.playerB).toEqual({ state: "known", id: "g1p3" });
    expect(r["L1-2"]?.fromMatch).toBe("W1-1");
    expect(r["W2-1"]?.status).toBe("ready");
  });

  it("si gana el cuadro de ganadores, no hay segunda final", () => {
    const { result } = playAll(def);
    const gf2 = result.matches.find((x) => x.code === "GF2");
    expect(gf2?.status).toBe("void");
    expect(result.champion).toBe("g2p1");
    expect(result.matches.filter((x) => x.status === "ready" || x.status === "waiting")).toEqual([]);
  });

  it("si gana el que viene de perdedores, se juega la segunda final", () => {
    // En la gran final gana B (perdedores); en la segunda final gana A (que fue B en GF).
    const { result } = playAll(def, (code) => (code === "GF" ? "B" : "A"));
    const gf2 = result.matches.find((x) => x.code === "GF2");
    expect(gf2?.status).toBe("played");
    expect(result.champion).not.toBeNull();
    expect(result.champion).toBe(gf2?.winner.state === "known" ? gf2.winner.id : null);
  });

  it("una corrección anterior invalida los resultados que dependían de ella", () => {
    const { stored } = playAll(def);
    // Cambiamos el ganador de A: E deja de valer (ya no lo juegan los mismos).
    const first = stored["W1-1"] as StoredResult;
    const changed = { ...stored, "W1-1": { ...first, gamesA: 0, gamesB: 2 } };
    const r = Object.fromEntries(resolveBracket(def, changed).matches.map((x) => [x.code, x]));
    expect(r["W2-1"]?.status).toBe("ready");
    expect(resolveBracket(def, changed).champion).toBeNull();
  });
});

describe("tres grupos: pases directos a los mejores 1.º", () => {
  const def = buildBracket([group(1, 4), group(2, 4, 2), group(3, 4, 1)]);

  it("los dos mejores 1.º pasan directos y nadie juega contra su propio grupo en la primera ronda", () => {
    const { matches } = resolveBracket(def, {});
    const first = matches.filter((x) => x.side === "winners" && x.round === 1);
    const byes = first.filter((x) => x.status === "bye").map((x) => (x.winner.state === "known" ? x.winner.id : ""));
    expect(byes.sort()).toEqual(["g2p1", "g3p1"]);
    for (const x of first.filter((y) => y.status === "ready")) {
      if (x.playerA.state === "known" && x.playerB.state === "known") {
        expect(def.groupOf[x.playerA.id]).not.toBe(def.groupOf[x.playerB.id]);
      }
    }
  });

  it("se puede jugar entero hasta tener campeón", () => {
    const { result } = playAll(def);
    expect(result.champion).toBe("g2p1");
    expect(result.matches.filter((x) => x.status === "ready" || x.status === "waiting")).toEqual([]);
  });

  it("el mejor 3.º recibe el pase si sobra plaza en perdedores", () => {
    const { stored } = playAll(def);
    const l1 = resolveBracket(def, stored).matches.filter((x) => x.side === "losers" && x.round === 1);
    const thirdByes = l1.filter((x) => x.status === "bye" && x.winner.state === "known" && x.winner.id.endsWith("p3"));
    expect(thirdByes.map((x) => (x.winner.state === "known" ? x.winner.id : ""))).toContain(def.thirds[0]);
  });
});

describe("colocación de los perdedores frente a los 3.º", () => {
  it("cada perdedor va donde le espera un 3.º de otro grupo", () => {
    const groupOf = { a1: 1, b1: 2, a3: 1, b3: 2 };
    const out = assignLosers(
      [
        { state: "known", id: "a1" },
        { state: "known", id: "b1" },
      ],
      ["a3", "b3"],
      groupOf,
    );
    // El perdedor 0 (grupo 1) va al hueco 1 (3.º del grupo 2) y al revés.
    expect(out).toEqual([1, 0]);
  });

  it("si ya cruzan bien, no se mueve nadie", () => {
    const groupOf = { a1: 1, b1: 2, a3: 1, b3: 2 };
    expect(
      assignLosers(
        [
          { state: "known", id: "b1" },
          { state: "known", id: "a1" },
        ],
        ["a3", "b3"],
        groupOf,
      ),
    ).toEqual([0, 1]);
  });

  it("los huecos sin perdedor (pases directos) son para los mejores 3.º", () => {
    const groupOf = { x: 1, y: 2, t1: 3, t2: 1, t3: 2 };
    const out = assignLosers(
      [{ state: "empty" }, { state: "known", id: "x" }, { state: "empty" }, { state: "known", id: "y" }],
      ["t1", "t2", "t3", null],
      groupOf,
    );
    // Ningún perdedor queda sin 3.º; el mejor 3.º (hueco 0) pasa solo y el hueco sin 3.º queda vacío.
    expect([out[0], out[3]].every((i) => i === 0 || i === 2)).toBe(true);
    // Cruces entre grupos: x (grupo 1) contra t3 (grupo 2) e y (grupo 2) contra t2 (grupo 1).
    expect(out[1]).toBe(3);
    expect(out[2]).toBe(1);
  });
});
