import * as z from "zod";

/** Lógica pura de torneos e inscripciones (sin base de datos): validación y reglas. */

export const tournamentStatuses = ["DRAFT", "PUBLISHED", "IN_PROGRESS", "FINISHED"] as const;
export type TournamentStatus = (typeof tournamentStatuses)[number];

export const previousParticipations = ["LAST_EDITION", "FIRST_TIME", "EARLIER_EDITIONS"] as const;
export type PreviousParticipation = (typeof previousParticipations)[number];

/** Un torneo en borrador solo lo ven los administradores. */
export function isPublic(status: TournamentStatus): boolean {
  return status !== "DRAFT";
}

/** Se puede inscribir si la inscripción está abierta y el torneo está publicado o en marcha. */
export function canRegister(tournament: { status: TournamentStatus; registrationOpen: boolean }): boolean {
  return tournament.registrationOpen && (tournament.status === "PUBLISHED" || tournament.status === "IN_PROGRESS");
}

/** Dirección legible a partir del nombre: «VI Liga Puente 3» → «vi-liga-puente-3». */
export function slugify(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "torneo";
}

/** Primera dirección libre: «liga», «liga-2», «liga-3»… */
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

// --- Requisito de pertenecer al servidor de Discord --------------------------

export type GuildRequirement = "ok" | "not_member" | "unknown";

/**
 * Si se ha configurado un servidor (DISCORD_GUILD_ID), solo se pueden inscribir
 * sus miembros. `guildMember` se comprueba al iniciar sesión (null = sin comprobar).
 */
export function guildRequirement(guildId: string | undefined, guildMember: boolean | null): GuildRequirement {
  if (!guildId) return "ok";
  if (guildMember === true) return "ok";
  if (guildMember === false) return "not_member";
  return "unknown";
}

// --- Formularios -------------------------------------------------------------

const text = (max: number) => z.string().trim().min(1, "required").max(max, "too_long");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "too_long")
    .transform((value) => (value === "" ? null : value));
const yesNo = z.enum(["yes", "no"], { error: "required" }).transform((value) => value === "yes");
const optionalDate = z
  .string()
  .trim()
  .refine((value) => value === "" || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))), "invalid")
  .transform((value) => (value === "" ? null : new Date(`${value}T00:00:00Z`)));

export const registrationSchema = z
  .object({
    previousParticipation: z.enum(previousParticipations, { error: "required" }),
    firstTimeBigWin: z.enum(["yes", "no", ""]).optional(),
    streamingConsent: yesNo,
    city: text(80),
    country: text(80),
    rulesAccepted: z.literal("yes", { error: "required" }),
  })
  .superRefine((data, ctx) => {
    if (data.previousParticipation === "FIRST_TIME" && !data.firstTimeBigWin) {
      ctx.addIssue({ code: "custom", path: ["firstTimeBigWin"], message: "required" });
    }
  })
  .transform((data) => ({
    previousParticipation: data.previousParticipation,
    // Solo tiene sentido si es la primera vez.
    firstTimeBigWin: data.previousParticipation === "FIRST_TIME" ? data.firstTimeBigWin === "yes" : null,
    streamingConsent: data.streamingConsent,
    city: data.city,
    country: data.country,
  }));

export type RegistrationInput = z.output<typeof registrationSchema>;

export const tournamentSchema = z.object({
  name: z.string().trim().min(3, "too_short").max(100, "too_long"),
  description: optionalText(2000),
  rulesUrl: optionalText(500).refine(
    (value) => value === null || /^https:\/\/[^\s]+$/.test(value),
    "invalid_url",
  ),
  startsOn: optionalDate,
  matchDeadlineOn: optionalDate,
  status: z.enum(tournamentStatuses, { error: "required" }),
  registrationOpen: z
    .string()
    .optional()
    .transform((value) => value === "on" || value === "yes"),
  promotions: z.coerce.number().int("invalid").min(0, "invalid").max(10, "invalid"),
  relegations: z.coerce.number().int("invalid").min(0, "invalid").max(10, "invalid"),
});

export type TournamentInput = z.output<typeof tournamentSchema>;

export type FieldErrors = Record<string, string>;

/** Convierte un FormData (o un objeto) en un objeto de textos para validar. */
export function formToObject(form: FormData | Record<string, string>): Record<string, string> {
  if (!(form instanceof FormData)) return form;
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

/** Valida y devuelve los datos o un error por campo (código de error). */
export function validate<T extends z.ZodType>(
  schema: T,
  form: FormData | Record<string, string>,
): { ok: true; data: z.output<T> } | { ok: false; errors: FieldErrors } {
  const result = schema.safeParse(formToObject(form));
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "form");
    errors[field] ??= issue.message === "required" || issue.message.length < 20 ? issue.message : "invalid";
  }
  return { ok: false, errors };
}
