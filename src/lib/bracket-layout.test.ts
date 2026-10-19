import { describe, expect, it } from "vitest";
import { buildBracket, type GroupStanding } from "./bracket";
import { layoutBracket } from "./bracket-layout";

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

describe("disposición del cuadro", () => {
  it("dos grupos: como el cuadro de la V edición", () => {
    const def = buildBracket([group(1, 5), group(2, 5, 1)]);
    const visible = new Set(def.matches.filter((m) => m.code !== "GF2").map((m) => m.code));
    const layout = layoutBracket(def.matches, visible);
    const at = Object.fromEntries(layout.nodes.map((n) => [n.code, n]));
    // A y B en la primera columna, arriba; E entre los dos y alineada con G (las dos finales de cuadro).
    expect([at["W1-1"]?.col, at["W1-2"]?.col]).toEqual([0, 0]);
    expect(at["W2-1"]?.row).toBe(0.5);
    expect(at["W2-1"]?.col).toBe(at["L3-1"]?.col);
    // C y D debajo (repesca), F a su derecha, G después y H a la derecha de todo.
    expect([at["L1-1"]?.col, at["L2-1"]?.col, at["L3-1"]?.col, at.GF?.col]).toEqual([0, 1, 2, 3]);
    expect(at["L1-1"]?.row).toBeGreaterThan(at["W1-2"]?.row ?? 0);
    // La segunda final no se dibuja si no se juega.
    expect(at.GF2).toBeUndefined();
    // Líneas: ganador de A a E; perdedor de E a G; G y E a la gran final.
    expect(layout.edges).toContainEqual({ from: "W1-1", to: "W2-1", kind: "winner" });
    expect(layout.edges).toContainEqual({ from: "W2-1", to: "L3-1", kind: "loser" });
    expect(layout.edges).toContainEqual({ from: "L3-1", to: "GF", kind: "winner" });
    expect(layout.edges.filter((e) => e.to === "GF")).toHaveLength(2);
    // Mientras no se sabe, el perdedor de A va hacia C.
    expect(layout.edges).toContainEqual({ from: "W1-1", to: "L1-1", kind: "loser" });
  });

  it("la línea de repesca sale del partido donde perdió cada uno", () => {
    const def = buildBracket([group(1, 5), group(2, 5, 1)]);
    const visible = new Set(def.matches.map((m) => m.code));
    const layout = layoutBracket(def.matches, visible, { "L1-1": "W1-2", "L1-2": "W1-1" });
    expect(layout.edges).toContainEqual({ from: "W1-2", to: "L1-1", kind: "loser" });
    expect(layout.edges).toContainEqual({ from: "W1-1", to: "L1-2", kind: "loser" });
  });

  it("si se juega la segunda final, va a la derecha de la gran final", () => {
    const def = buildBracket([group(1, 4), group(2, 4)]);
    const layout = layoutBracket(def.matches, new Set(def.matches.map((m) => m.code)));
    const at = Object.fromEntries(layout.nodes.map((n) => [n.code, n]));
    expect(at.GF2?.col).toBe((at.GF?.col ?? 0) + 1);
    expect(at.GF2?.row).toBe(at.GF?.row);
    expect(layout.edges).toContainEqual({ from: "GF", to: "GF2", kind: "winner" });
  });

  it("tres grupos: la final del cuadro de ganadores, a la altura de la de la repesca", () => {
    const def = buildBracket([group(1, 4), group(2, 4, 2), group(3, 4, 1)]);
    const layout = layoutBracket(def.matches, new Set(def.matches.map((m) => m.code)));
    const at = Object.fromEntries(layout.nodes.map((n) => [n.code, n]));
    const lastWinners = Math.max(...def.matches.filter((m) => m.side === "winners").map((m) => m.round));
    const lastLosers = Math.max(...def.matches.filter((m) => m.side === "losers").map((m) => m.round));
    const winnersFinal = def.matches.find((m) => m.side === "winners" && m.round === lastWinners)?.code ?? "";
    const losersFinal = def.matches.find((m) => m.side === "losers" && m.round === lastLosers)?.code ?? "";
    expect(at[winnersFinal]?.col).toBe(at[losersFinal]?.col);
    expect(at.GF?.col).toBe((at[losersFinal]?.col ?? 0) + 1);
  });

  it("un grupo: semifinales y final", () => {
    const def = buildBracket([group(1, 6)]);
    const layout = layoutBracket(def.matches, new Set(def.matches.map((m) => m.code)));
    const at = Object.fromEntries(layout.nodes.map((n) => [n.code, n]));
    expect([at.S1?.col, at.S2?.col, at.FINAL?.col]).toEqual([0, 0, 1]);
    expect(at.FINAL?.row).toBe(0.5);
    expect(layout.repechageRow).toBeNull();
  });
});
