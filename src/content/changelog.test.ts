import { describe, expect, it } from "vitest";
import pkg from "../../package.json";
import { changelog } from "./changelog";

describe("changelog", () => {
  it("la entrada más reciente coincide con la versión de package.json", () => {
    expect(changelog[0]?.version).toBe(pkg.version);
  });

  it("las versiones no se repiten y las fechas van de más nueva a más antigua", () => {
    const versions = changelog.map((entry) => entry.version);
    expect(new Set(versions).size).toBe(versions.length);
    const dates = changelog.map((entry) => entry.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("cada entrada tiene cambios en español e inglés", () => {
    for (const entry of changelog) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.changes.es.length).toBeGreaterThan(0);
      expect(entry.changes.en.length).toBe(entry.changes.es.length);
    }
  });
});
