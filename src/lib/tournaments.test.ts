import { describe, expect, it } from "vitest";
import {
  canRegister,
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

  it("solo se inscribe con la inscripción abierta y el torneo publicado o en marcha", () => {
    expect(canRegister({ status: "PUBLISHED", registrationOpen: true })).toBe(true);
    // La Común admite inscripciones con el torneo ya empezado.
    expect(canRegister({ status: "IN_PROGRESS", registrationOpen: true })).toBe(true);
    expect(canRegister({ status: "PUBLISHED", registrationOpen: false })).toBe(false);
    expect(canRegister({ status: "DRAFT", registrationOpen: true })).toBe(false);
    expect(canRegister({ status: "FINISHED", registrationOpen: true })).toBe(false);
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

  it("limita ascensos y descensos entre 0 y 10", () => {
    expect(validate(tournamentSchema, { ...valid, promotions: "11" }).ok).toBe(false);
    expect(validate(tournamentSchema, { ...valid, relegations: "-1" }).ok).toBe(false);
  });
});
