import { describe, expect, it } from "vitest";
import {
  actions,
  can,
  checkRoleChange,
  discordIdFromPlaceholder,
  effectiveRole,
  hasRole,
  canReceiveProjectDocsAccess,
  isConfigAdmin,
  parseAdminIds,
  permissions,
  placeholderEmail,
  projectDocsAccess,
  roles,
} from "./roles";

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
    expect(effectiveRole("MODERATOR", "222222222222222222", admins)).toBe("MODERATOR");
    expect(effectiveRole("ADMIN", "222222222222222222", admins)).toBe("ADMIN");
  });

  it("vuelve a PLAYER si el rol falta o no es válido (incluido el antiguo ORGANIZER)", () => {
    expect(effectiveRole(undefined, "222222222222222222", admins)).toBe("PLAYER");
    expect(effectiveRole("ORGANIZER", null, admins)).toBe("PLAYER");
  });
});

describe("hasRole", () => {
  it("respeta la jerarquía PLAYER < MODERATOR < ADMIN", () => {
    expect(hasRole("ADMIN", "MODERATOR")).toBe(true);
    expect(hasRole("MODERATOR", "MODERATOR")).toBe(true);
    expect(hasRole("MODERATOR", "ADMIN")).toBe(false);
    expect(hasRole("PLAYER", "MODERATOR")).toBe(false);
  });
});

describe("permisos", () => {
  it("todos pueden jugar y borrar su cuenta (también los administradores)", () => {
    for (const role of roles) {
      expect(can(role, "tournaments.join")).toBe(true);
      expect(can(role, "profile.delete")).toBe(true);
    }
  });

  it("los moderadores ayudan con partidas, cruces y resultados, pero no gestionan torneos ni usuarios", () => {
    expect(can("MODERATOR", "admin.access")).toBe(true);
    expect(can("MODERATOR", "matches.manage")).toBe(true);
    expect(can("MODERATOR", "results.manage")).toBe(true);
    expect(can("MODERATOR", "achievements.manage")).toBe(true);
    expect(can("MODERATOR", "registrations.close")).toBe(true);
    expect(can("MODERATOR", "tournaments.manage")).toBe(false);
    expect(can("MODERATOR", "registrations.manage")).toBe(false);
    expect(can("MODERATOR", "users.manage")).toBe(false);
  });

  it("los jugadores no entran en administración", () => {
    expect(can("PLAYER", "admin.access")).toBe(false);
    expect(can("PLAYER", "results.manage")).toBe(false);
    expect(can("PLAYER", "achievements.manage")).toBe(false);
    expect(can("PLAYER", "registrations.close")).toBe(false);
  });

  it("los administradores pueden hacerlo todo", () => {
    for (const action of actions) expect(can("ADMIN", action)).toBe(true);
  });

  it("cada permiso respeta la jerarquía: si un rol puede, los superiores también", () => {
    for (const action of actions) {
      for (const role of permissions[action]) {
        for (const higher of roles.filter((r) => hasRole(r, role))) expect(can(higher, action)).toBe(true);
      }
    }
  });
});

describe("checkRoleChange", () => {
  const admins = parseAdminIds("111111111111111111");
  const admin = { id: "a", role: "ADMIN" as const };
  const target = { id: "b", discordId: "222222222222222222" };

  it("un administrador puede nombrar moderadores y administradores", () => {
    expect(checkRoleChange(admin, target, "MODERATOR", admins)).toEqual({ ok: true });
    expect(checkRoleChange(admin, target, "ADMIN", admins)).toEqual({ ok: true });
    expect(checkRoleChange(admin, target, "PLAYER", admins)).toEqual({ ok: true });
  });

  it("un moderador no puede cambiar roles", () => {
    expect(checkRoleChange({ id: "m", role: "MODERATOR" }, target, "MODERATOR", admins)).toEqual({
      ok: false,
      reason: "not_allowed",
    });
  });

  it("nadie cambia su propio rol", () => {
    expect(checkRoleChange(admin, { id: "a", discordId: "333333333333333333" }, "PLAYER", admins)).toEqual({
      ok: false,
      reason: "self",
    });
  });

  it("los administradores por configuración no se cambian desde la web", () => {
    expect(checkRoleChange(admin, { id: "c", discordId: "111111111111111111" }, "PLAYER", admins)).toEqual({
      ok: false,
      reason: "config_admin",
    });
  });

  it("rechaza roles desconocidos", () => {
    expect(checkRoleChange(admin, target, "SUPERUSER", admins)).toEqual({ ok: false, reason: "invalid_role" });
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

describe("documentación del proyecto", () => {
  const admins = parseAdminIds("111111111111111111");

  it("los administradores por configuración la ven, la editan y dan acceso", () => {
    expect(projectDocsAccess({ discordId: "111111111111111111", role: "ADMIN", projectDocsAccess: false }, admins)).toEqual({
      view: true,
      edit: true,
      grant: true,
    });
  });

  it("un administrador con el acceso activado solo la ve", () => {
    expect(projectDocsAccess({ discordId: "222222222222222222", role: "ADMIN", projectDocsAccess: true }, admins)).toEqual({
      view: true,
      edit: false,
      grant: false,
    });
  });

  it("el resto no la ve, aunque sea administrador por la base de datos", () => {
    expect(projectDocsAccess({ discordId: "333333333333333333", role: "ADMIN", projectDocsAccess: false }, admins).view).toBe(false);
    expect(isConfigAdmin("333333333333333333", admins)).toBe(false);
    expect(isConfigAdmin(null, admins)).toBe(false);
  });

  it("moderadores y jugadores no la ven aunque tengan la casilla activada", () => {
    expect(projectDocsAccess({ discordId: "444444444444444444", role: "MODERATOR", projectDocsAccess: true }, admins).view).toBe(false);
    expect(projectDocsAccess({ discordId: "555555555555555555", role: "PLAYER", projectDocsAccess: true }, admins).view).toBe(false);
  });

  it("solo se puede dar acceso a administradores (no por configuración)", () => {
    expect(canReceiveProjectDocsAccess({ discordId: "222222222222222222", role: "ADMIN" }, admins)).toBe(true);
    expect(canReceiveProjectDocsAccess({ discordId: "222222222222222222", role: "MODERATOR" }, admins)).toBe(false);
    expect(canReceiveProjectDocsAccess({ discordId: "222222222222222222", role: "PLAYER" }, admins)).toBe(false);
    expect(canReceiveProjectDocsAccess({ discordId: "111111111111111111", role: "ADMIN" }, admins)).toBe(false);
  });
});
