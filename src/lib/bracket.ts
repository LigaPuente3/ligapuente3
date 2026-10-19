/**
 * Motor de las eliminatorias (lógica pura, sin base de datos). Reglas en docs/LIGA.md.
 *
 * - Un solo grupo: eliminación simple con los 4 primeros (1.º-4.º y 2.º-3.º, final),
 *   o final directa 1.º-2.º si hay menos de 4.
 * - Dos o más grupos: doble eliminación. Cuadro de ganadores con los 1.º y 2.º
 *   (1.º contra 2.º de otro grupo; pases directos a los mejores 1.º si no se llena),
 *   cuadro de repesca donde los 3.º esperan a los perdedores de la primera ronda
 *   (de otro grupo siempre que se pueda) y gran final con posible segunda final.
 *
 * `buildBracket` crea la definición (quién juega y de dónde sale cada plaza) y
 * Los 3.º están colocados desde el principio y no se mueven; los perdedores de la
 * primera ronda se colocan donde les espera un 3.º de otro grupo.
 * `resolveBracket` calcula, con los resultados guardados, los jugadores, el estado
 * y el ganador de cada partido. Los resultados se guardan con los jugadores que lo
 * jugaron: si una corrección anterior cambia quién llega a un partido, su resultado
 * deja de valer.
 */

// --- Tipos -------------------------------------------------------------------------

export type GroupStanding = {
  /** Número del grupo dentro de la división (1, 2…). */
  group: number;
  /** Clasificación ya ordenada (1.º primero). */
  rows: { playerId: string; points: number; gamesWon: number; gamesLost: number }[];
};

export type Source =
  | { kind: "seed"; playerId: string | null }
  | { kind: "winner"; match: string }
  | { kind: "loser"; match: string }
  /** Un perdedor de la primera ronda, colocado donde le espera un 3.º de otro grupo. */
  | { kind: "firstRoundLoser" };

export type BracketSide = "winners" | "losers" | "final" | "single";

export type MatchDef = {
  code: string;
  /** Letra para mostrar: A, B, C… */
  label: string;
  side: BracketSide;
  /** Ronda dentro de su cuadro (1, 2…), para dibujar columnas. */
  round: number;
  a: Source;
  b: Source;
  /** Segunda final: solo se juega si gana el que viene del cuadro de repesca. */
  resetOf?: string;
};

export type BracketDef = {
  format: "single" | "double";
  matches: MatchDef[];
  /** 3.º clasificados, de mejor a peor (doble eliminación). */
  thirds: string[];
  /** Grupo de cada jugador clasificado. */
  groupOf: Record<string, number>;
};

export type StoredResult = { playerAId: string; playerBId: string; gamesA: number; gamesB: number };

export type Participant = { state: "known"; id: string } | { state: "empty" } | { state: "pending" };

export type ResolvedMatch = MatchDef & {
  /** En la repesca de la primera ronda: partido de donde viene el perdedor (para dibujar la línea). */
  fromMatch?: string;
  playerA: Participant;
  playerB: Participant;
  /** waiting: faltan jugadores; ready: se puede jugar; played; bye: pasa solo; void: no se juega. */
  status: "waiting" | "ready" | "played" | "bye" | "void";
  gamesA: number | null;
  gamesB: number | null;
  winner: Participant;
  loser: Participant;
};

export type ResolvedBracket = { matches: ResolvedMatch[]; champion: string | null };

// --- Utilidades ----------------------------------------------------------------------

const EMPTY: Participant = { state: "empty" };
const PENDING: Participant = { state: "pending" };
const known = (id: string): Participant => ({ state: "known", id });

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/** Orden clásico de cabezas de serie: con 8, [1,8,4,5,2,7,3,6] (el 1 y el 2 solo se ven en la final). */
export function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const next = order.length * 2 + 1;
    order = order.flatMap((s) => [s, next - s]);
  }
  return order;
}

type Ranked = { playerId: string; group: number; points: number; gamesWon: number; diff: number };

/** Ordena jugadores de distintos grupos: puntos, juegos ganados, diferencia de juegos y número de grupo. */
function rankAcrossGroups(list: Ranked[]): Ranked[] {
  return [...list].sort(
    (x, y) => y.points - x.points || y.gamesWon - x.gamesWon || y.diff - x.diff || x.group - y.group,
  );
}

function letters(index: number): string {
  let s = "";
  let n = index;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

// --- Construcción ----------------------------------------------------------------------

/** Crea el cuadro de una división a partir de las clasificaciones de sus grupos. */
export function buildBracket(groups: GroupStanding[]): BracketDef {
  const groupOf: Record<string, number> = {};
  for (const g of groups) for (const r of g.rows) groupOf[r.playerId] = g.group;

  if (groups.length <= 1) return buildSingle(groups[0]?.rows.map((r) => r.playerId) ?? [], groupOf);

  const place = (n: number): Ranked[] =>
    rankAcrossGroups(
      groups.flatMap((g) => {
        const r = g.rows[n];
        return r ? [{ playerId: r.playerId, group: g.group, points: r.points, gamesWon: r.gamesWon, diff: r.gamesWon - r.gamesLost }] : [];
      }),
    );
  const firsts = place(0);
  const seconds = place(1);
  const thirds = place(2).map((t) => t.playerId);
  return buildDouble([...firsts, ...seconds], thirds, groupOf);
}

function buildSingle(ranked: string[], groupOf: Record<string, number>): BracketDef {
  const matches: MatchDef[] = [];
  if (ranked.length >= 4) {
    const [p1, p2, p3, p4] = ranked as [string, string, string, string];
    matches.push(
      { code: "S1", label: "A", side: "single", round: 1, a: { kind: "seed", playerId: p1 }, b: { kind: "seed", playerId: p4 } },
      { code: "S2", label: "B", side: "single", round: 1, a: { kind: "seed", playerId: p2 }, b: { kind: "seed", playerId: p3 } },
      { code: "FINAL", label: "C", side: "single", round: 2, a: { kind: "winner", match: "S1" }, b: { kind: "winner", match: "S2" } },
    );
  } else if (ranked.length >= 2) {
    matches.push({
      code: "FINAL",
      label: "A",
      side: "single",
      round: 1,
      a: { kind: "seed", playerId: ranked[0] ?? null },
      b: { kind: "seed", playerId: ranked[1] ?? null },
    });
  }
  return { format: "single", matches, thirds: [], groupOf };
}

function buildDouble(seeds: Ranked[], thirds: string[], groupOf: Record<string, number>): BracketDef {
  const size = nextPowerOfTwo(Math.max(2, seeds.length));
  const rounds = Math.log2(size);
  const order = seedOrder(size);
  // Primera ronda: cabezas de serie; las plazas sin jugador son pases directos para los mejores.
  const firstRound: [Ranked | null, Ranked | null][] = [];
  for (let i = 0; i < size; i += 2) {
    firstRound.push([seeds[(order[i] as number) - 1] ?? null, seeds[(order[i + 1] as number) - 1] ?? null]);
  }
  avoidSameGroup(firstRound);

  const defs: MatchDef[] = [];
  const add = (m: Omit<MatchDef, "label">) => defs.push({ ...m, label: "" });

  firstRound.forEach(([x, y], i) =>
    add({
      code: `W1-${i + 1}`,
      side: "winners",
      round: 1,
      a: { kind: "seed", playerId: x?.playerId ?? null },
      b: { kind: "seed", playerId: y?.playerId ?? null },
    }),
  );
  // Repesca, ronda 1: los 3.º esperan colocados (el mejor, en el primer partido); los perdedores
  // de la primera ronda se colocan al resolver, buscando 3.º de otro grupo.
  for (let i = 1; i <= size / 2; i++) {
    add({
      code: `L1-${i}`,
      side: "losers",
      round: 1,
      a: { kind: "firstRoundLoser" },
      b: { kind: "seed", playerId: thirds[i - 1] ?? null },
    });
  }
  let lastLosers = 1;
  for (let k = 2; k <= rounds; k++) {
    const count = size / 2 ** k;
    for (let i = 1; i <= count; i++) {
      add({
        code: `W${k}-${i}`,
        side: "winners",
        round: k,
        a: { kind: "winner", match: `W${k - 1}-${2 * i - 1}` },
        b: { kind: "winner", match: `W${k - 1}-${2 * i}` },
      });
    }
    // Consolidación: los ganadores de la repesca se cruzan entre sí.
    const cons = lastLosers + 1;
    for (let i = 1; i <= count; i++) {
      add({
        code: `L${cons}-${i}`,
        side: "losers",
        round: cons,
        a: { kind: "winner", match: `L${cons - 1}-${2 * i - 1}` },
        b: { kind: "winner", match: `L${cons - 1}-${2 * i}` },
      });
    }
    // Entrada: contra los que pierden esta ronda del cuadro de ganadores (en orden inverso, para no repetir cruces).
    const drop = cons + 1;
    for (let i = 1; i <= count; i++) {
      add({
        code: `L${drop}-${i}`,
        side: "losers",
        round: drop,
        a: { kind: "winner", match: `L${cons}-${i}` },
        b: { kind: "loser", match: `W${k}-${count + 1 - i}` },
      });
    }
    lastLosers = drop;
  }
  add({
    code: "GF",
    side: "final",
    round: 1,
    a: { kind: "winner", match: `W${rounds}-1` },
    b: { kind: "winner", match: `L${lastLosers}-1` },
  });
  add({ code: "GF2", side: "final", round: 2, a: { kind: "winner", match: "GF" }, b: { kind: "loser", match: "GF" }, resetOf: "GF" });

  // Letras en orden de juego: ronda a ronda, primero ganadores y luego repesca.
  // Ronda k del cuadro de ganadores, luego su consolidación y su entrada en la repesca.
  const sortKey = (m: MatchDef) => {
    if (m.side === "final") return 1000 + m.round;
    if (m.side === "winners") return m.round * 10;
    if (m.round === 1) return 11;
    return m.round % 2 === 0 ? ((m.round + 2) / 2) * 10 + 1 : ((m.round + 1) / 2) * 10 + 2;
  };
  [...defs]
    .map((m, i) => ({ m, i }))
    .sort((x, y) => sortKey(x.m) - sortKey(y.m) || x.i - y.i)
    .forEach(({ m }, i) => {
      m.label = letters(i);
    });
  // La segunda final lleva la letra de la final con un 2 (p. ej. «H2»).
  const gf = defs.find((m) => m.code === "GF");
  const gf2 = defs.find((m) => m.code === "GF2");
  if (gf && gf2) gf2.label = `${gf.label}2`;
  return { format: "double", matches: defs, thirds, groupOf };
}

/** Si en la primera ronda un 1.º y un 2.º son del mismo grupo, intercambia 2.º entre partidos. */
function avoidSameGroup(pairs: [Ranked | null, Ranked | null][]) {
  for (let i = 0; i < pairs.length; i++) {
    const [x, y] = pairs[i] as [Ranked | null, Ranked | null];
    if (!x || !y || x.group !== y.group) continue;
    for (let j = 0; j < pairs.length; j++) {
      if (j === i) continue;
      const [x2, y2] = pairs[j] as [Ranked | null, Ranked | null];
      if (!x2 || !y2) continue;
      if (y2.group !== x.group && y.group !== x2.group) {
        (pairs[i] as [Ranked | null, Ranked | null])[1] = y2;
        (pairs[j] as [Ranked | null, Ranked | null])[1] = y;
        break;
      }
    }
  }
}

// --- Resolución ------------------------------------------------------------------------

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [item, ...p]));
}

/**
 * Coloca a los perdedores de la primera ronda (por partido de origen) frente a los
 * 3.º, que están fijos: el máximo de cruces entre grupos distintos y, si hay plazas
 * sin perdedor (pases directos en la primera ronda), que el pase sea para los mejores
 * 3.º (los primeros partidos). Devuelve, para cada partido de repesca, el índice del
 * partido de la primera ronda de donde viene su perdedor.
 */
export function assignLosers(losers: Participant[], thirdsBySlot: (string | null)[], groupOf: Record<string, number>): number[] {
  const indexes = losers.map((_, i) => i);
  let best = indexes;
  let bestScore = -Infinity;
  for (const perm of permutations(indexes)) {
    let crossGroup = 0;
    let byeRank = 0;
    let loserWithoutThird = 0;
    perm.forEach((loserIndex, slot) => {
      const loser = losers[loserIndex];
      const third = thirdsBySlot[slot];
      if (!loser) return;
      if (loser.state === "known" && !third) loserWithoutThird++;
      if (loser.state === "known" && third && groupOf[loser.id] !== groupOf[third]) crossGroup++;
      if (loser.state === "empty" && third) byeRank += slot;
    });
    // Desempate estable: el orden natural (perdedor de A con el primer 3.º…).
    const stay = perm.filter((loserIndex, slot) => loserIndex === slot).length;
    // Prioridades: ningún perdedor sin 3.º delante (pasaría gratis), cruces entre grupos,
    // pases para los mejores 3.º y, por último, no mover a nadie sin necesidad.
    const score = -loserWithoutThird * 1_000_000 + crossGroup * 10_000 - byeRank * 100 + stay;
    if (score > bestScore) {
      bestScore = score;
      best = perm;
    }
  }
  return best;
}

function sourceValue(src: Source, results: Map<string, ResolvedMatch>): Participant {
  if (src.kind === "seed") return src.playerId ? known(src.playerId) : EMPTY;
  if (src.kind === "firstRoundLoser") return PENDING; // se coloca aparte
  const m = results.get(src.match);
  if (!m) return PENDING;
  return src.kind === "winner" ? m.winner : m.loser;
}

/** Calcula jugadores, estado y ganador de cada partido con los resultados guardados (por código). */
export function resolveBracket(def: BracketDef, stored: Record<string, StoredResult>): ResolvedBracket {
  const resolved = new Map<string, ResolvedMatch>();
  let loserSlots: number[] | null = null;

  for (const m of def.matches) {
    let a = sourceValue(m.a, resolved);
    let b = sourceValue(m.b, resolved);

    let fromMatch: string | undefined;
    if (m.a.kind === "firstRoundLoser") {
      const firstRound = def.matches.filter((x) => x.side === "winners" && x.round === 1);
      const losers = firstRound.map((x) => resolved.get(x.code)?.loser ?? PENDING);
      if (losers.some((l) => l.state === "pending")) a = PENDING;
      else {
        loserSlots ??= assignLosers(
          losers,
          def.matches.filter((x) => x.a.kind === "firstRoundLoser").map((x) => (x.b.kind === "seed" ? x.b.playerId : null)),
          def.groupOf,
        );
        const slot = Number(m.code.split("-")[1]) - 1;
        const from = loserSlots[slot] ?? slot;
        a = losers[from] ?? EMPTY;
        fromMatch = firstRound[from]?.code;
      }
    }

    // La segunda final solo existe si el que venía de la repesca ganó la primera.
    if (m.resetOf) {
      const first = resolved.get(m.resetOf);
      const fromLosers = first?.playerB;
      const wonByLosers =
        first?.status === "played" && fromLosers?.state === "known" && first.winner.state === "known" && first.winner.id === fromLosers.id;
      if (!wonByLosers) {
        a = first?.status === "played" || first?.status === "bye" || first?.status === "void" ? EMPTY : PENDING;
        b = a;
      }
    }

    const base = { ...m, playerA: a, playerB: b, gamesA: null, gamesB: null, ...(fromMatch ? { fromMatch } : {}) };
    let match: ResolvedMatch;
    if (a.state === "pending" || b.state === "pending") {
      match = { ...base, status: "waiting", winner: PENDING, loser: PENDING };
    } else if (a.state === "empty" && b.state === "empty") {
      match = { ...base, status: "void", winner: EMPTY, loser: EMPTY };
    } else if (a.state === "empty" || b.state === "empty") {
      match = { ...base, status: "bye", winner: a.state === "known" ? a : b, loser: EMPTY };
    } else {
      const r = stored[m.code];
      // Solo vale el resultado guardado si lo jugaron estos mismos jugadores.
      if (r && r.playerAId === a.id && r.playerBId === b.id && r.gamesA !== r.gamesB) {
        const aWins = r.gamesA > r.gamesB;
        match = {
          ...base,
          gamesA: r.gamesA,
          gamesB: r.gamesB,
          status: "played",
          winner: aWins ? a : b,
          loser: aWins ? b : a,
        };
      } else {
        match = { ...base, status: "ready", winner: PENDING, loser: PENDING };
      }
    }
    resolved.set(m.code, match);
  }

  const matches = def.matches.map((m) => resolved.get(m.code) as ResolvedMatch);
  return { matches, champion: championOf(def, resolved) };
}

function championOf(def: BracketDef, resolved: Map<string, ResolvedMatch>): string | null {
  const pick = (code: string) => {
    const m = resolved.get(code);
    return m && (m.status === "played" || m.status === "bye") && m.winner.state === "known" ? m.winner.id : null;
  };
  if (def.format === "single") return pick("FINAL");
  const gf = resolved.get("GF");
  if (!gf || (gf.status !== "played" && gf.status !== "bye")) return null;
  const gf2 = resolved.get("GF2");
  if (gf2 && gf2.status !== "void") return pick("GF2");
  return pick("GF");
}
