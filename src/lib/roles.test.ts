import { describe, expect, it } from "vitest";
import { discordIdFromPlaceholder, effectiveRole, hasRole, parseAdminIds, placeholderEmail } from "./roles";

describe("parseAdminIds", () => {
  it("separa por comas, quita espacios y descarta valores no numéricos", () => {
    expect([...parseAdminIds(" 123456789012345678, abc ,, 98765432109876543 ")]).toEqual([
      "123456789012345678",
      "98765432109876543",
    ]);
  });

  it("devuelve un conjunto vacío si no hay variable", () => {
    expect(parseAdminIds(undefined).size).toBe(0);
    expect(parseAdminIds("").size).toBe(0);
  });
});

describe("effectiveRole", () => {
  const admins = parseAdminIds("111111111111111111");

  it("da ADMIN a quien está en ADMIN_DISCORD_IDS aunque en la BD sea PLAYER", () => {
    expect(effectiveRole("PLAYER", "111111111111111111", admins)).toBe("ADMIN");
  });

  it("usa el rol de la base de datos en los demás casos", () => {
    expect(effectiveRole("ORGANIZER", "222222222222222222", admins)).toBe("ORGANIZER");
    expect(effectiveRole("ADMIN", "222222222222222222", admins)).toBe("ADMIN");
  });

  it("vuelve a PLAYER si el rol falta o no es válido", () => {
    expect(effectiveRole(undefined, "222222222222222222", admins)).toBe("PLAYER");
    expect(effectiveRole("SUPERUSER", null, admins)).toBe("PLAYER");
  });
});

describe("hasRole", () => {
  it("respeta la jerarquía PLAYER < ORGANIZER < ADMIN", () => {
    expect(hasRole("ADMIN", "ORGANIZER")).toBe(true);
    expect(hasRole("ORGANIZER", "ORGANIZER")).toBe(true);
    expect(hasRole("ORGANIZER", "ADMIN")).toBe(false);
    expect(hasRole("PLAYER", "ORGANIZER")).toBe(false);
  });
});

describe("placeholderEmail / discordIdFromPlaceholder", () => {
  it("usa el dominio reservado .invalid", () => {
    expect(placeholderEmail("123456789012345678")).toBe("123456789012345678@discord.invalid");
  });

  it("recupera el ID de Discord del correo ficticio", () => {
    expect(discordIdFromPlaceholder(placeholderEmail("123456789012345678"))).toBe("123456789012345678");
  });

  it("devuelve null con cualquier otro correo", () => {
    expect(discordIdFromPlaceholder("alguien@example.com")).toBeNull();
    expect(discordIdFromPlaceholder("abc@discord.invalid")).toBeNull();
    expect(discordIdFromPlaceholder(undefined)).toBeNull();
  });
});
