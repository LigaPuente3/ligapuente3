import { describe, expect, it } from "vitest";
import {
  adminRegistrationSchema,
  canRegister,
  registrationReason,
  registrationState,
  guildRequirement,
  isPublic,
  registrationSchema,
  slugify,
  tournamentSchema,
  uniqueSlug,
  validate,
} from "./tournaments";

describe("slugify / uniqueSlug", () => {
  it("convierte el nombre en una dirección legible", () => {
    expect(slugify("VI Liga Puente 3")).toBe("vi-liga-puente-3");
    expect(slugify("  Liga de Otoño ¡2026!  ")).toBe("liga-de-otono-2026");
    expect(slugify("***")).toBe("torneo");
  });

  it("añade un número si la dirección ya existe", () => {
    expect(uniqueSlug("liga", new Set())).toBe("liga");
    expect(uniqueSlug("liga", new Set(["liga", "liga-2"]))).toBe("liga-3");
  });
});

describe("visibilidad e inscripción", () => {
  it("los borradores no son públicos", () => {
    expect(isPublic("DRAFT")).toBe(false);
    expect(isPublic("PUBLISHED")).toBe(true);
    expect(isPublic("FINISHED")).toBe(true);
  });

  it("solo se inscribe con el torneo publicado y la casilla marcada", () => {
    expect(canRegister({ status: "PUBLISHED", registrationOpen: true })).toBe(true);
    expect(canRegister({ status: "PUBLISHED", registrationOpen: false })).toBe(false);
    expect(canRegister({ status: "DRAFT", registrationOpen: true })).toBe(false);
    expect(canRegister({ status: "FINISHED", registrationOpen: true })).toBe(false);
  });

  it("con el torneo en juego la inscripción está siempre cerrada", () => {
    expect(registrationState({ status: "IN_PROGRESS", registrationOpen: true })).toBe("closed");
  });

  it("respeta la ventana de apertura y cierre", () => {
    const window = {
      status: "PUBLISHED" as const,
      registrationOpen: true,
      registrationOpensAt: new Date("2026-10-20T16:00:00Z"),
      registrationClosesAt: new Date("2026-10-25T22:00:00Z"),
    };
    expect(registrationState(window, new Date("2026-10-20T15:59:00Z"))).toBe("not_yet");
    expect(registrationState(window, new Date("2026-10-20T16:00:00Z"))).toBe("open");
    expect(registrationState(window, new Date("2026-10-25T21:59:00Z"))).toBe("open");
    expect(registrationState(window, new Date("2026-10-25T22:00:00Z"))).toBe("closed");
    // Cerrada a mano (casilla desmarcada) aunque esté dentro de la ventana.
    expect(registrationState({ ...window, registrationOpen: false }, new Date("2026-10-22T10:00:00Z"))).toBe("closed");
  });

  it("sin fechas, depende solo del estado y la casilla", () => {
    expect(registrationState({ status: "PUBLISHED", registrationOpen: true, registrationOpensAt: null, registrationClosesAt: null })).toBe("open");
  });
});

describe("guildRequirement", () => {
  it("no exige nada si no hay servidor configurado", () => {
    expect(guildRequirement(undefined, null)).toBe("ok");
    expect(guildRequirement("", false)).toBe("ok");
  });

  it("con servidor configurado exige ser miembro", () => {
    expect(guildRequirement("123", true)).toBe("ok");
    expect(guildRequirement("123", false)).toBe("not_member");
    expect(guildRequirement("123", null)).toBe("unknown");
  });
});

describe("formulario de inscripción", () => {
  const valid = {
    previousParticipation: "LAST_EDITION",
    streamingConsent: "yes",
    city: " Madrid ",
    country: "España",
    rulesAccepted: "yes",
  };

  it("acepta un formulario completo y limpia los textos", () => {
    const result = validate(registrationSchema, valid);
    expect(result).toEqual({
      ok: true,
      data: {
        previousParticipation: "LAST_EDITION",
        firstTimeBigWin: null,
        streamingConsent: true,
        city: "Madrid",
        country: "España",
      },
    });
  });

  it("si es la primera vez, exige la pregunta de PQ/Sector/Regional", () => {
    expect(validate(registrationSchema, { ...valid, previousParticipation: "FIRST_TIME" })).toEqual({
      ok: false,
      errors: { firstTimeBigWin: "required" },
    });
    const ok = validate(registrationSchema, { ...valid, previousParticipation: "FIRST_TIME", firstTimeBigWin: "no" });
    expect(ok.ok && ok.data.firstTimeBigWin).toBe(false);
  });

  it("ignora la pregunta de PQ si no es la primera vez", () => {
    const result = validate(registrationSchema, { ...valid, firstTimeBigWin: "yes" });
    expect(result.ok && result.data.firstTimeBigWin).toBeNull();
  });

  it("exige aceptar las bases, ciudad, país y la respuesta de retransmisión", () => {
    const result = validate(registrationSchema, {
      previousParticipation: "LAST_EDITION",
      city: "  ",
      country: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["city", "country", "rulesAccepted", "streamingConsent"]);
    }
  });

  it("rechaza textos demasiado largos", () => {
    const result = validate(registrationSchema, { ...valid, city: "x".repeat(81) });
    expect(result).toEqual({ ok: false, errors: { city: "too_long" } });
  });
});

describe("formulario de torneo", () => {
  const valid = {
    name: "VI Liga Puente 3",
    description: "",
    rulesUrl: "https://example.com/bases",
    startsOn: "2026-10-16",
    matchDeadlineOn: "",
    status: "PUBLISHED",
    registrationOpen: "on",
    promotions: "1",
    relegations: "1",
  };

  it("acepta un torneo válido", () => {
    const result = validate(tournamentSchema, valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.description).toBeNull();
      expect(result.data.startsOn?.toISOString()).toBe("2026-10-16T00:00:00.000Z");
      expect(result.data.matchDeadlineOn).toBeNull();
      expect(result.data.registrationOpen).toBe(true);
      expect(result.data.promotions).toBe(1);
    }
  });

  it("la inscripción queda cerrada si no se marca la casilla", () => {
    const rest: Record<string, string> = { ...valid };
    delete rest.registrationOpen;
    const result = validate(tournamentSchema, rest);
    expect(result.ok && result.data.registrationOpen).toBe(false);
  });

  it("solo admite enlaces https a las bases y fechas válidas", () => {
    expect(validate(tournamentSchema, { ...valid, rulesUrl: "javascript:alert(1)" })).toEqual({
      ok: false,
      errors: { rulesUrl: "invalid_url" },
    });
    expect(validate(tournamentSchema, { ...valid, startsOn: "16/10/2026" })).toEqual({
      ok: false,
      errors: { startsOn: "invalid" },
    });
  });

  it("lee la ventana de inscripción en hora de España", () => {
    const result = validate(tournamentSchema, { ...valid, registrationOpensAt: "2026-10-20T18:00", registrationClosesAt: "2026-10-26T23:59" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.registrationOpensAt?.toISOString()).toBe("2026-10-20T16:00:00.000Z");
      expect(result.data.registrationClosesAt?.toISOString()).toBe("2026-10-26T22:59:00.000Z");
    }
  });

  it("el cierre de la inscripción tiene que ser posterior a la apertura", () => {
    expect(validate(tournamentSchema, { ...valid, registrationOpensAt: "2026-10-26T10:00", registrationClosesAt: "2026-10-20T10:00" })).toEqual({
      ok: false,
      errors: { registrationClosesAt: "before_open" },
    });
  });

  it("limita ascensos y descensos entre 0 y 10", () => {
    expect(validate(tournamentSchema, { ...valid, promotions: "11" }).ok).toBe(false);
    expect(validate(tournamentSchema, { ...valid, relegations: "-1" }).ok).toBe(false);
  });
});

describe("alta manual por un administrador", () => {
  it("acepta un alta con división y sin ciudad ni país", () => {
    const result = validate(adminRegistrationSchema, {
      userId: "u1",
      previousParticipation: "FIRST_TIME",
      streamingConsent: "no",
      city: "",
      country: "",
      division: "COMMON",
    });
    expect(result).toEqual({
      ok: true,
      data: { userId: "u1", previousParticipation: "FIRST_TIME", streamingConsent: false, city: "", country: "", division: "COMMON" },
    });
  });

  it("exige el usuario y rechaza divisiones desconocidas", () => {
    const result = validate(adminRegistrationSchema, {
      userId: "",
      previousParticipation: "LAST_EDITION",
      streamingConsent: "yes",
      city: "",
      country: "",
      division: "MYTHIC",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["division", "userId"]);
  });
});

describe("motivo del estado de la inscripción", () => {
  const now = new Date("2026-10-19T10:30:00Z");
  const base = {
    status: "PUBLISHED" as const,
    registrationOpen: true,
    registrationOpensAt: new Date("2026-10-19T10:00:00Z"),
    registrationClosesAt: new Date("2026-10-24T10:23:00Z"),
  };

  it("explica por qué está cerrada", () => {
    expect(registrationReason({ ...base, status: "DRAFT" }, now)).toBe("draft");
    expect(registrationReason({ ...base, status: "IN_PROGRESS" }, now)).toBe("in_progress");
    expect(registrationReason({ ...base, status: "FINISHED" }, now)).toBe("finished");
    expect(registrationReason({ ...base, registrationOpen: false }, now)).toBe("disabled");
    expect(registrationReason(base, new Date("2026-10-19T09:59:00Z"))).toBe("not_yet");
    expect(registrationReason(base, new Date("2026-10-24T10:23:00Z"))).toBe("ended");
  });

  it("y coincide con el estado cuando está abierta", () => {
    expect(registrationReason(base, now)).toBe("open");
    expect(registrationState(base, now)).toBe("open");
  });
});
