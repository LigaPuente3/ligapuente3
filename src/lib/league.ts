/**
 * Lógica pura de la liguilla (sin base de datos): divisiones, sorteo de grupos,
 * cruces de todos contra todos, resultados al mejor de 3 y clasificación.
 * Reglas en docs/LIGA.md.
 */

/** Divisiones de la más alta a la más baja. */
export const divisionTiers = ["LEGENDARY", "RARE", "UNCOMMON", "COMMON"] as const;
export type DivisionTier = (typeof divisionTiers)[number];

export const POINTS = { win: 3, draw: 1, loss: 0 } as const;

// --- Sorteo y cruces -----------------------------------------------------------

/** Generador pseudoaleatorio con semilla (para tests reproducibles). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Baraja (Fisher-Yates) sin modificar la lista original. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * Reparte al azar los jugadores en `groupCount` grupos equilibrados: los
 * tamaños se diferencian como mucho en 1.
 */
export function drawGroups<T>(players: readonly T[], groupCount: number, random: () => number = Math.random): T[][] {
  if (!Number.isInteger(groupCount) || groupCount < 1) throw new Error("groupCount must be >= 1");
  if (groupCount > players.length) throw new Error("more groups than players");
  const groups: T[][] = Array.from({ length: groupCount }, () => []);
  shuffle(players, random).forEach((player, index) => groups[index % groupCount]?.push(player));
  return groups;
}

/** Todos los cruces de todos contra todos: n·(n-1)/2 partidos. */
export function roundRobinPairs<T>(players: readonly T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) pairs.push([players[i] as T, players[j] as T]);
  }
  return pairs;
}

/** Cruces de un jugador que entra tarde en un grupo contra los que ya estaban. */
export function pairsForNewMember<T>(newcomer: T, existing: readonly T[]): [T, T][] {
  return existing.map((other) => [other, newcomer] as [T, T]);
}

// --- Resultados ----------------------------------------------------------------

export type Score = { gamesA: number; gamesB: number };

/** Resultados posibles al mejor de 3. No hay empates: se juega hasta que alguien gana 2 partidas. */
export const moderatorResults = ["2-0", "2-1", "1-2", "0-2"] as const;
export type ResultChoice = (typeof moderatorResults)[number];

/** Juegos que puede marcar un jugador en cada desplegable. */
export const gameCounts = [0, 1, 2] as const;

export function parseResult(value: unknown): Score | null {
  if (typeof value !== "string" || !(moderatorResults as readonly string[]).includes(value)) return null;
  const [a, b] = value.split("-").map(Number);
  return { gamesA: a as number, gamesB: b as number };
}

/**
 * Resultado que anota un jugador: sus juegos y los de su rival (0, 1 o 2).
 * Tiene que ser un partido terminado al mejor de 3 (alguien llega a 2): 2-0, 2-1, 1-2 o 0-2.
 * Se guarda en el lado (A/B) que corresponda al jugador.
 */
export function playerReportToScore(ownRaw: unknown, rivalRaw: unknown, reporterIsA: boolean): Score | null {
  if (typeof ownRaw !== "string" || typeof rivalRaw !== "string" || ownRaw === "" || rivalRaw === "") return null;
  const own = Number(ownRaw);
  const rival = Number(rivalRaw);
  const valid = (n: number) => Number.isInteger(n) && n >= 0 && n <= 2;
  if (!valid(own) || !valid(rival)) return null;
  const finished = (own === 2 && rival < 2) || (rival === 2 && own < 2);
  if (!finished) return null;
  return reporterIsA ? { gamesA: own, gamesB: rival } : { gamesA: rival, gamesB: own };
}

/**
 * ¿Puede este jugador informar del resultado? Solo con el torneo en juego, el
 * partido pendiente y si juega ese partido.
 */
export function canReportResult(
  match: { status: string; playerAId: string | null; playerBId: string | null },
  registrationId: string | null,
  tournamentStatus: string,
): "A" | "B" | null {
  if (!registrationId || tournamentStatus !== "IN_PROGRESS" || match.status !== "PENDING") return null;
  if (match.playerAId === registrationId) return "A";
  if (match.playerBId === registrationId) return "B";
  return null;
}

// --- Clasificación ---------------------------------------------------------------

export type MatchForStandings = {
  playerAId: string | null;
  playerBId: string | null;
  status: string;
  gamesA: number | null;
  gamesB: number | null;
};

export type StandingRow = {
  playerId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
};

function isPlayed(m: MatchForStandings): m is MatchForStandings & { gamesA: number; gamesB: number } {
  return m.status === "PLAYED" && m.gamesA !== null && m.gamesB !== null;
}

function emptyRow(playerId: string): StandingRow {
  return { playerId, position: 0, played: 0, won: 0, drawn: 0, lost: 0, gamesWon: 0, gamesLost: 0, points: 0 };
}

/** Suma un partido a la fila de un jugador (desde su punto de vista). */
function addResult(row: StandingRow, own: number, other: number) {
  row.played++;
  row.gamesWon += own;
  row.gamesLost += other;
  if (own > other) {
    row.won++;
    row.points += POINTS.win;
  } else if (own < other) {
    row.lost++;
    row.points += POINTS.loss;
  } else {
    row.drawn++;
    row.points += POINTS.draw;
  }
}

function tally(playerIds: readonly string[], matches: readonly MatchForStandings[]): Map<string, StandingRow> {
  const rows = new Map(playerIds.map((id) => [id, emptyRow(id)]));
  for (const m of matches) {
    if (!isPlayed(m)) continue;
    // Si un jugador borró su cuenta (lado a null), el partido sigue contando para el otro.
    const a = m.playerAId ? rows.get(m.playerAId) : undefined;
    const b = m.playerBId ? rows.get(m.playerBId) : undefined;
    if (a) addResult(a, m.gamesA, m.gamesB);
    if (b) addResult(b, m.gamesB, m.gamesA);
  }
  return rows;
}

/**
 * Clasificación del grupo. Orden: puntos (3/1/0), juegos ganados,
 * enfrentamiento directo (puntos en los partidos entre los empatados) y
 * diferencia de juegos. Si sigue el empate, se mantiene el orden recibido.
 */
export function computeStandings(playerIds: readonly string[], matches: readonly MatchForStandings[]): StandingRow[] {
  const rows = tally(playerIds, matches);
  const order = new Map(playerIds.map((id, index) => [id, index]));
  const byMain = [...rows.values()].sort(
    (x, y) => y.points - x.points || y.gamesWon - x.gamesWon || (order.get(x.playerId) ?? 0) - (order.get(y.playerId) ?? 0),
  );

  const result: StandingRow[] = [];
  for (let i = 0; i < byMain.length; ) {
    const first = byMain[i] as StandingRow;
    let j = i + 1;
    while (j < byMain.length && byMain[j]?.points === first.points && byMain[j]?.gamesWon === first.gamesWon) j++;
    const tied = byMain.slice(i, j);
    if (tied.length > 1) {
      const ids = new Set(tied.map((r) => r.playerId));
      const headToHead = tally(
        [...ids],
        matches.filter((m) => m.playerAId && m.playerBId && ids.has(m.playerAId) && ids.has(m.playerBId)),
      );
      tied.sort(
        (x, y) =>
          (headToHead.get(y.playerId)?.points ?? 0) - (headToHead.get(x.playerId)?.points ?? 0) ||
          y.gamesWon - y.gamesLost - (x.gamesWon - x.gamesLost) ||
          (order.get(x.playerId) ?? 0) - (order.get(y.playerId) ?? 0),
      );
    }
    result.push(...tied);
    i = j;
  }
  return result.map((row, index) => ({ ...row, position: index + 1 }));
}

// --- Zonas de ascenso y descenso -------------------------------------------------

export type Zone =
  | { kind: "champion" }
  | { kind: "promotion"; to: DivisionTier }
  | { kind: "relegation"; to: DivisionTier }
  | null;

/** División inmediatamente superior o inferior (null si no hay). */
export function adjacentTier(tier: DivisionTier, direction: "up" | "down"): DivisionTier | null {
  const index = divisionTiers.indexOf(tier) + (direction === "up" ? -1 : 1);
  return divisionTiers[index] ?? null;
}

/**
 * Zona de una posición en la clasificación de un grupo: los `promotions` primeros
 * suben a la división superior (en Legendaria, el primero es el campeón, en dorado)
 * y los `relegations` últimos bajan a la inferior (en Común no se baja).
 * Ascenso y descenso no se pisan aunque el grupo sea pequeño.
 */
export function zoneFor(
  tier: DivisionTier,
  position: number,
  groupSize: number,
  promotions: number,
  relegations: number,
): Zone {
  const up = adjacentTier(tier, "up");
  const down = adjacentTier(tier, "down");
  if (up === null && position === 1) return { kind: "champion" };
  if (up !== null && position <= promotions) return { kind: "promotion", to: up };
  const firstRelegated = Math.max(groupSize - relegations + 1, (up === null ? 1 : promotions) + 1);
  if (down !== null && position >= firstRelegated) return { kind: "relegation", to: down };
  return null;
}
