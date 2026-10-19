import { describe, expect, it } from "vitest";
import { discordAvatarUrl, discordScopes } from "./discord";

describe("discordAvatarUrl", () => {
  it("usa el avatar del usuario (gif si es animado)", () => {
    expect(discordAvatarUrl({ id: "123", avatar: "abc" })).toBe("https://cdn.discordapp.com/avatars/123/abc.png");
    expect(discordAvatarUrl({ id: "123", avatar: "a_abc" })).toBe("https://cdn.discordapp.com/avatars/123/a_abc.gif");
  });

  it("sin avatar, usa uno de los avatares por defecto", () => {
    expect(discordAvatarUrl({ id: "80351110224678912", avatar: null, discriminator: "0" })).toMatch(
      /^https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png$/,
    );
    expect(discordAvatarUrl({ id: "1", avatar: null, discriminator: "1337" })).toBe(
      "https://cdn.discordapp.com/embed/avatars/2.png",
    );
  });
});

describe("discordScopes", () => {
  it("solo pide identify si no hay servidor que comprobar", () => {
    expect(discordScopes(undefined)).toEqual(["identify"]);
    expect(discordScopes("")).toEqual(["identify"]);
  });

  it("añade guilds.members.read si hay servidor configurado", () => {
    expect(discordScopes("123")).toEqual(["identify", "guilds.members.read"]);
  });
});
