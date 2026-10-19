import type { MatchDef } from "@/lib/bracket";

/**
 * Disposición del cuadro para dibujarlo (lógica pura): columna y fila de cada
 * partido y las líneas que los unen. Columnas = rondas, de izquierda a derecha;
 * arriba el cuadro de ganadores, debajo la repesca y, a la derecha, la final.
 */

export type LayoutNode = { code: string; col: number; row: number };
export type LayoutEdge = { from: string; to: string; kind: "winner" | "loser" };
export type BracketLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  cols: number;
  rows: number;
  /** Fila donde empieza la repesca (para su rótulo), o null si no hay. */
  repechageRow: number | null;
};

/**
 * `fromMatch`: para la primera ronda de repesca, de qué partido viene el perdedor
 * (cuando ya se sabe); si no se sabe, la línea sale del partido con el mismo número.
 */
export function layoutBracket(
  matches: MatchDef[],
  visible: Set<string>,
  fromMatch: Record<string, string | undefined> = {},
): BracketLayout {
  const shown = matches.filter((m) => visible.has(m.code));
  const pos = new Map<string, { col: number; row: number }>();
  const byCode = new Map(matches.map((m) => [m.code, m]));
  const sourceRow = (code: string | undefined) => (code ? pos.get(code)?.row : undefined);
  const srcMatch = (m: MatchDef, side: "a" | "b") => {
    const s = m[side];
    return s.kind === "winner" || s.kind === "loser" ? s.match : undefined;
  };
  const average = (m: MatchDef, fallback: number) => {
    const rows = [sourceRow(srcMatch(m, "a")), sourceRow(srcMatch(m, "b"))].filter((r): r is number => r !== undefined);
    return rows.length ? rows.reduce((x, y) => x + y, 0) / rows.length : fallback;
  };

  const winners = shown.filter((m) => m.side === "winners" || m.side === "single");
  const losers = shown.filter((m) => m.side === "losers");
  const finals = shown.filter((m) => m.side === "final");

  // Cuadro de ganadores (o eliminación simple): la primera ronda en filas seguidas; las demás, entre sus orígenes.
  const firstRound = winners.filter((m) => m.round === 1);
  firstRound.forEach((m, i) => pos.set(m.code, { col: 0, row: i }));
  const maxWinnersRound = Math.max(0, ...winners.map((m) => m.round));
  for (let r = 2; r <= maxWinnersRound; r++) {
    winners.filter((m) => m.round === r).forEach((m, i) => pos.set(m.code, { col: r - 1, row: average(m, i) }));
  }

  // Repesca, debajo, con una fila de separación.
  const winnersRows = firstRound.length;
  const repechageRow = losers.length ? winnersRows + 0.5 : null;
  if (repechageRow !== null) {
    const maxLosersRound = Math.max(...losers.map((m) => m.round));
    losers.filter((m) => m.round === 1).forEach((m, i) => pos.set(m.code, { col: 0, row: repechageRow + i }));
    for (let r = 2; r <= maxLosersRound; r++) {
      losers
        .filter((m) => m.round === r)
        .forEach((m, i) => {
          // Rondas de entrada (impares): a la altura de su ganador de repesca; de consolidación: entre sus orígenes.
          const row = r % 2 === 1 ? (sourceRow(srcMatch(m, "a")) ?? repechageRow + i) : average(m, repechageRow + i);
          pos.set(m.code, { col: r - 1, row });
        });
    }
  }

  // La final de cada cuadro, alineada: la del cuadro de ganadores sube a la altura de la de la repesca,
  // porque las dos entran en la gran final.
  if (repechageRow !== null && maxWinnersRound > 1) {
    const lastLosersCol = Math.max(...losers.map((m) => pos.get(m.code)?.col ?? 0));
    for (const m of winners.filter((x) => x.round === maxWinnersRound)) {
      const p = pos.get(m.code);
      if (p && p.col < lastLosersCol) pos.set(m.code, { ...p, col: lastLosersCol });
    }
  }

  // Final(es), a la derecha de todo.
  const lastCol = Math.max(0, ...[...pos.values()].map((p) => p.col));
  finals
    .sort((x, y) => x.round - y.round)
    .forEach((m, i) => {
      const reset = m.resetOf ? pos.get(m.resetOf) : undefined;
      pos.set(m.code, { col: lastCol + 1 + i, row: reset ? reset.row : average(m, 0) });
    });

  const nodes = shown.map((m) => ({ code: m.code, ...(pos.get(m.code) as { col: number; row: number }) }));
  const edges: LayoutEdge[] = [];
  for (const m of shown) {
    if (m.resetOf) {
      if (visible.has(m.resetOf)) edges.push({ from: m.resetOf, to: m.code, kind: "winner" });
      continue;
    }
    if (m.a.kind === "firstRoundLoser") {
      const from = fromMatch[m.code] ?? `W1-${m.code.split("-")[1]}`;
      if (visible.has(from)) edges.push({ from, to: m.code, kind: "loser" });
    }
    for (const side of ["a", "b"] as const) {
      const s = m[side];
      if ((s.kind === "winner" || s.kind === "loser") && visible.has(s.match) && byCode.has(s.match)) {
        edges.push({ from: s.match, to: m.code, kind: s.kind });
      }
    }
  }
  const cols = Math.max(0, ...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(0, ...nodes.map((n) => n.row)) + 1;
  return { nodes, edges, cols, rows, repechageRow };
}
