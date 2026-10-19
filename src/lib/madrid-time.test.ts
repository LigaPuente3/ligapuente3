import { describe, expect, it } from "vitest";
import { madridLocalToUtc, utcToMadridInput } from "./madrid-time";

describe("hora de España ↔ UTC", () => {
  it("en invierno España va 1 hora por delante de UTC", () => {
    expect(madridLocalToUtc("2026-12-01T18:00")?.toISOString()).toBe("2026-12-01T17:00:00.000Z");
  });

  it("en verano España va 2 horas por delante de UTC", () => {
    expect(madridLocalToUtc("2026-07-01T18:00")?.toISOString()).toBe("2026-07-01T16:00:00.000Z");
  });

  it("el día del cambio de hora de otoño (25 de octubre de 2026)", () => {
    expect(madridLocalToUtc("2026-10-24T12:00")?.toISOString()).toBe("2026-10-24T10:00:00.000Z");
    expect(madridLocalToUtc("2026-10-25T12:00")?.toISOString()).toBe("2026-10-25T11:00:00.000Z");
  });

  it("ida y vuelta", () => {
    for (const value of ["2026-01-15T09:30", "2026-08-20T23:59", "2026-10-25T04:00"]) {
      const utc = madridLocalToUtc(value);
      expect(utc && utcToMadridInput(utc)).toBe(value);
    }
  });

  it("rechaza formatos no válidos", () => {
    expect(madridLocalToUtc("")).toBeNull();
    expect(madridLocalToUtc("20/10/2026 18:00")).toBeNull();
    expect(madridLocalToUtc("2026-13-01T10:00")).toBeNull();
    expect(utcToMadridInput(null)).toBe("");
  });
});
