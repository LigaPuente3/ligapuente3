import Image from "next/image";
import { AchievementBadges } from "@/components/achievement-badges";
import { inputClass } from "@/components/forms/fields";
import type { AchievementType } from "@/lib/achievements";
import type { Participant, ResolvedMatch } from "@/lib/bracket";
import { reportBracketResult, setBracketResult } from "@/lib/bracket-actions";
import { loadBrackets } from "@/lib/bracket-data";
import { layoutBracket } from "@/lib/bracket-layout";
import { prisma } from "@/lib/db";
import { divisionTiers, moderatorResults, type DivisionTier } from "@/lib/league";
import { can } from "@/lib/roles";
import type { CurrentUser } from "@/lib/session";
import type { Dictionary } from "@/i18n/es";
import { format } from "@/i18n/locale";
import { BracketViewer } from "./bracket-viewer";
import { ReportResultForm } from "./report-result-form";
import { tierBadgeClass } from "./tier-styles";

type Player = { name: string; image: string | null; achievements: { type: AchievementType; count: number }[] };

// Medidas del dibujo (px).
const CARD_W = 176;
const CARD_H = 92;
const SLOT_W = CARD_W + 16;
const V_GAP = 56;
const LEVEL_H = CARD_H + V_GAP;
// Hueco arriba para el rótulo de la final y abajo para las líneas de la primera ronda y los rótulos.
const TOP = 24;
const BOTTOM = 56;

function Name({ p, players, dict, strong }: { p: Participant; players: Map<string, Player>; dict: Dictionary; strong?: boolean }) {
  const b = dict.bracket;
  if (p.state === "pending") return <span className="truncate text-muted italic">{b.tbd}</span>;
  if (p.state === "empty") return <span className="text-muted">—</span>;
  const player = players.get(p.id);
  if (!player) return <span className="truncate text-muted italic">{b.deleted}</span>;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {player.image ? <Image src={player.image} alt="" width={20} height={20} className="size-5 shrink-0 rounded-full" /> : null}
      <span className={`min-w-0 truncate ${strong ? "font-semibold" : ""}`}>{player.name}</span>
    </span>
  );
}

/** Tarjeta de un partido en el dibujo: letra, estado, jugadores y resultado. */
function MatchCard({ m, players, dict, championId }: { m: ResolvedMatch; players: Map<string, Player>; dict: Dictionary; championId: string | null }) {
  const b = dict.bracket;
  const winnerId = m.status === "played" && m.winner.state === "known" ? m.winner.id : null;
  const status = m.status === "bye" ? b.bye : m.status === "waiting" ? b.waiting : m.status === "ready" ? b.pending : "";
  const row = (p: Participant, games: number | null) => {
    const won = p.state === "known" && p.id === winnerId;
    const champ = won && p.id === championId;
    return (
      <div className={`flex h-[34px] items-center justify-between gap-2 px-2 ${champ ? "bg-tier-champion/20" : won ? "bg-wood/15" : ""}`}>
        <Name p={p} players={players} dict={dict} strong={won} />
        <span className={`shrink-0 font-semibold tabular-nums ${won ? "text-wood-light" : "text-muted"}`}>{games ?? ""}</span>
      </div>
    );
  };
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface text-sm shadow">
      <div className="flex h-[22px] items-center justify-between border-b border-border px-2 text-xs text-muted">
        <span className="font-bold text-wood-light">{m.label}</span>
        <span className="truncate">{status}</span>
      </div>
      {row(m.playerA, m.gamesA)}
      <div className="border-t border-border" />
      {row(m.playerB, m.gamesB)}
    </div>
  );
}

/**
 * Dibujo del cuadro en vertical, como un «top 8»: la primera ronda abajo y la final arriba.
 * A la izquierda, el cuadro de ganadores; a la derecha, la repesca. Las líneas suben de
 * cada partido al siguiente (continua, el ganador; discontinua, el perdedor).
 */
function BracketDiagram({
  matches,
  players,
  dict,
  championId,
}: {
  matches: ResolvedMatch[];
  players: Map<string, Player>;
  dict: Dictionary;
  championId: string | null;
}) {
  const b = dict.bracket;
  // No se dibujan los partidos que no se juegan; la segunda final, solo si se va a jugar.
  const visible = new Set(
    matches.filter((m) => m.status !== "void" && (!m.resetOf || m.status === "ready" || m.status === "played")).map((m) => m.code),
  );
  const fromMatch = Object.fromEntries(matches.filter((m) => m.fromMatch).map((m) => [m.code, m.fromMatch]));
  const layout = layoutBracket(matches, visible, fromMatch);
  const byCode = new Map(matches.map((m) => [m.code, m]));
  // La disposición va por rondas (columnas) y puestos (filas); aquí se gira: rondas hacia arriba.
  const levels = layout.cols - 1;
  const at = new Map(
    layout.nodes.map((n) => [n.code, { x: n.row * SLOT_W, y: TOP + (levels - n.col) * LEVEL_H }]),
  );
  const width = (layout.rows - 1) * SLOT_W + CARD_W;
  const firstRoundY = TOP + levels * LEVEL_H;
  const height = firstRoundY + CARD_H + BOTTOM;

  // Cada línea llega al lado del jugador que entra: el de arriba por la izquierda y el de abajo por la derecha.
  const entryX = (from: string, to: string) => {
    const m = byCode.get(to);
    if (!m || m.resetOf) return CARD_W / 2;
    const s = m.b;
    return (s.kind === "winner" || s.kind === "loser") && s.match === from ? CARD_W * 0.7 : CARD_W * 0.3;
  };
  let sameLevel = 0;
  const path = (from: { x: number; y: number }, to: { x: number; y: number }, ex: number, kind: "winner" | "loser") => {
    const x1 = from.x + CARD_W / 2;
    const x2 = to.x + ex;
    if (to.y < from.y) {
      // Hacia arriba: en escalón por el hueco que hay justo debajo del partido de destino.
      const mid = to.y + CARD_H + (kind === "winner" ? V_GAP / 2 : V_GAP / 4);
      return `M ${x1} ${from.y} V ${mid} H ${x2} V ${to.y + CARD_H}`;
    }
    // Misma altura y nada en medio (perdedor de la final de ganadores a la de repesca): recta, de lado a lado.
    const between = [...at.values()].some((q) => q.y === from.y && q.x > Math.min(from.x, to.x) && q.x < Math.max(from.x, to.x));
    if (!between) {
      const y = from.y + CARD_H / 2;
      return to.x > from.x ? `M ${from.x + CARD_W} ${y} H ${to.x}` : `M ${from.x} ${y} H ${to.x + CARD_W}`;
    }
    // Misma altura con tarjetas en medio (perdedores de la primera ronda a la repesca): por debajo.
    const below = from.y + CARD_H + 10 + 8 * sameLevel++;
    return `M ${x1} ${from.y + CARD_H} V ${below} H ${x2} V ${to.y + CARD_H}`;
  };

  const grandFinal = layout.nodes.find((n) => byCode.get(n.code)?.side === "final" && !byCode.get(n.code)?.resetOf);
  const finalLabel = (code: string) => {
    const m = byCode.get(code);
    if (!m || m.side !== "final") return null;
    return m.resetOf ? b.reset : b.grandFinal;
  };

  return (
    <div className="relative mx-auto" style={{ width, height }}>
      <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden="true">
        {layout.edges.map((e) => {
          const from = at.get(e.from);
          const to = at.get(e.to);
          if (!from || !to) return null;
          return (
            <path
              key={`${e.from}-${e.to}-${e.kind}`}
              d={path(from, to, entryX(e.from, e.to), e.kind)}
              fill="none"
              stroke={e.kind === "winner" ? "var(--color-wood)" : "var(--color-muted)"}
              strokeWidth={e.kind === "winner" ? 2 : 1.5}
              strokeDasharray={e.kind === "loser" ? "5 4" : undefined}
              opacity={e.kind === "winner" ? 0.9 : 0.6}
            />
          );
        })}
      </svg>
      {/* Rótulos de cada parte del cuadro, debajo de su primera ronda. */}
      {layout.repechageRow !== null ? (
        <>
          <p className="absolute text-xs font-semibold text-muted" style={{ left: 0, top: height - 18 }}>
            {b.winners}
          </p>
          <p className="absolute text-xs font-semibold text-muted" style={{ left: layout.repechageRow * SLOT_W, top: height - 18 }}>
            {b.losers}
          </p>
        </>
      ) : null}
      {layout.nodes.map((n) => {
        const m = byCode.get(n.code);
        const p = at.get(n.code);
        if (!m || !p) return null;
        const label = grandFinal ? finalLabel(n.code) : null;
        return (
          <div key={n.code} className="absolute" style={{ left: p.x, top: p.y, width: CARD_W, height: CARD_H }}>
            {label ? (
              <p className="absolute -top-5 left-0 text-xs font-semibold text-wood-light">{label}</p>
            ) : null}
            <MatchCard m={m} players={players} dict={dict} championId={championId} />
          </div>
        );
      })}
    </div>
  );
}

/** Campeón en grande, en dorado. */
function ChampionCard({ id, players, dict, tier }: { id: string; players: Map<string, Player>; dict: Dictionary; tier: DivisionTier }) {
  const player = players.get(id);
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border-2 border-tier-champion bg-tier-champion/10 p-6 text-center shadow-lg">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-tier-champion">
        <span aria-hidden="true" className="text-2xl">
          🏆
        </span>
        {format(dict.bracket.championOf, { division: dict.league.divisions[tier] })}
      </p>
      {player?.image ? (
        <Image src={player.image} alt="" width={96} height={96} className="size-24 rounded-full border-2 border-tier-champion" />
      ) : null}
      <p className="text-2xl font-bold break-words">{player?.name ?? dict.bracket.deleted}</p>
      {player ? <AchievementBadges achievements={player.achievements} dict={dict} /> : null}
    </div>
  );
}

/** Eliminatorias del torneo: tus partidos, el campeón y un cuadro plegable por división. */
export async function BracketSection({
  tournamentId,
  tournamentStatus,
  user,
  dict,
}: {
  tournamentId: string;
  tournamentStatus: string;
  user: CurrentUser | null;
  dict: Dictionary;
}) {
  const brackets = await loadBrackets(tournamentId);
  if (brackets.length === 0) return null;
  const b = dict.bracket;

  const registrations = await prisma.registration.findMany({
    where: { tournamentId },
    select: { id: true, user: { select: { id: true, name: true, image: true, achievements: { select: { type: true, count: true } } } } },
  });
  const players = new Map<string, Player>(
    registrations.map((r) => [r.id, { name: r.user.name, image: r.user.image, achievements: r.user.achievements }]),
  );
  const myRegistration = user ? (registrations.find((r) => r.user.id === user.id)?.id ?? null) : null;
  const isModerator = Boolean(user && can(user.role, "results.manage"));

  const isMine = (m: ResolvedMatch) =>
    (m.playerA.state === "known" && m.playerA.id === myRegistration) || (m.playerB.state === "known" && m.playerB.id === myRegistration);
  const myMatches = myRegistration
    ? brackets.flatMap((br) => br.resolved.matches.filter((m) => m.status === "ready" && isMine(m)).map((m) => ({ bracketId: br.id, m })))
    : [];
  const reportTexts = {
    own: dict.league.reportOwn,
    rival: dict.league.reportRival,
    save: dict.league.reportSave,
    invalid: dict.league.reportInvalid,
    notAllowed: dict.league.resultNotAllowed,
    confirm: dict.league.reportConfirm,
    confirmYes: dict.league.reportConfirmYes,
    confirmNo: dict.league.reportConfirmNo,
  };

  return (
    <section
      aria-labelledby="eliminatorias-titulo"
      id="eliminatorias"
      // En pantallas grandes, el cuadro se sale de la columna de la página para verse entero.
      className="mt-10 scroll-mt-4 lg:relative lg:left-1/2 lg:w-[min(72rem,calc(100vw-3rem))] lg:-translate-x-1/2"
    >
      <h2 id="eliminatorias-titulo" className="text-xl font-semibold">
        {b.title}
      </h2>

      {myRegistration && tournamentStatus === "IN_PROGRESS" ? (
        <div className="mt-4 rounded-lg border border-wood bg-surface-2 p-4">
          <h3 className="font-semibold text-wood-light">{b.myMatches}</h3>
          {myMatches.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{b.noMatches}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {myMatches.map(({ bracketId, m }) => {
                const rival = m.playerA.state === "known" && m.playerA.id === myRegistration ? m.playerB : m.playerA;
                const rivalName = rival.state === "known" ? (players.get(rival.id)?.name ?? b.deleted) : b.tbd;
                return (
                  <li key={`${bracketId}-${m.code}`} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="font-bold text-wood-light">{m.label}</span>
                      <span className="text-muted">{dict.league.vs}</span>
                      <Name p={rival} players={players} dict={dict} />
                    </span>
                    <ReportResultForm
                      action={reportBracketResult}
                      matchId={`${bracketId}-${m.code}`}
                      hidden={{ bracketId, code: m.code }}
                      rivalName={rivalName}
                      texts={reportTexts}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {divisionTiers.map((tier) => {
        const br = brackets.find((x) => x.division === tier);
        if (!br) return null;
        const champion = br.resolved.champion;
        const editable = br.resolved.matches.filter(
          (m) => m.playerA.state === "known" && m.playerB.state === "known" && (m.status === "ready" || m.status === "played"),
        );
        return (
          <details key={tier} open className="mt-6 rounded-lg border border-border bg-surface">
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-3 text-lg font-semibold">
              <span aria-hidden="true" className={`inline-flex size-7 items-center justify-center rounded text-sm font-bold ${tierBadgeClass[tier]}`}>
                {dict.league.tierLetters[tier]}
              </span>
              {dict.league.divisions[tier]}
            </summary>
            <div className="px-4 pb-5">
              {champion ? <ChampionCard id={champion} players={players} dict={dict} tier={tier} /> : null}
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <span aria-hidden="true" className="inline-block h-0.5 w-6 bg-wood" />
                  {b.legendWinner}
                </span>
                {br.def.format === "double" ? (
                  <span className="flex items-center gap-1">
                    <span aria-hidden="true" className="inline-block w-6 border-t border-dashed border-muted" />
                    {b.legendLoser}
                  </span>
                ) : null}
                <span className="lg:hidden">{b.scroll}</span>
              </p>
              {/* El cuadro puede ser más ancho que la pantalla: se desplaza en horizontal a propósito. */}
              <BracketViewer
                texts={{
                  open: b.openFull,
                  close: b.closeFull,
                  fit: b.fitWidth,
                  actual: b.actualSize,
                  title: `${b.title} · ${dict.league.divisions[tier]}`,
                }}
              >
                <BracketDiagram matches={br.resolved.matches} players={players} dict={dict} championId={champion} />
              </BracketViewer>

              {isModerator && editable.length > 0 ? (
                <details className="mt-4 rounded-md border border-border bg-surface-2 p-3">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">{b.moderation}</summary>
                  <ul className="mt-2 flex flex-col gap-2">
                    {editable.map((m) => (
                      <li key={m.code}>
                        <form action={setBracketResult} className="flex flex-wrap items-center gap-2 text-sm">
                          <input type="hidden" name="bracketId" value={br.id} />
                          <input type="hidden" name="code" value={m.code} />
                          <span className="w-8 font-bold text-wood-light">{m.label}</span>
                          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                            <Name p={m.playerA} players={players} dict={dict} />
                            <span className="text-muted">{dict.league.vs}</span>
                            <Name p={m.playerB} players={players} dict={dict} />
                          </span>
                          <label htmlFor={`br-${br.id}-${m.code}`} className="sr-only">
                            {b.moderatorResult} {m.label}
                          </label>
                          <select
                            id={`br-${br.id}-${m.code}`}
                            name="result"
                            defaultValue={m.status === "played" ? `${m.gamesA}-${m.gamesB}` : "PENDING"}
                            className={`${inputClass} w-auto`}
                          >
                            <option value="PENDING">{b.pending}</option>
                            {moderatorResults.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="min-h-11 rounded-md border border-border px-3 hover:border-wood">
                            {dict.league.save}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </details>
        );
      })}
    </section>
  );
}
