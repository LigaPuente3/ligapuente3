import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-next";

describe("safeNextPath", () => {
  it("acepta rutas internas", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/docs?x=1")).toBe("/admin/docs?x=1");
  });

  it("rechaza otros dominios y valores raros", () => {
    expect(safeNextPath("https://example.com")).toBe("/");
    expect(safeNextPath("//example.com")).toBe("/");
    expect(safeNextPath("/\\example.com")).toBe("/");
    expect(safeNextPath("admin")).toBe("/");
    expect(safeNextPath("/a\nb")).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath(["/admin"])).toBe("/");
  });
});
