/** Llamadas a la API de Discord durante el inicio de sesión. */

const API = "https://discord.com/api";

export type DiscordProfile = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator?: string;
};

/** URL del avatar (o del avatar por defecto de Discord). Misma regla que Better Auth. */
export function discordAvatarUrl(profile: Pick<DiscordProfile, "id" | "avatar" | "discriminator">): string {
  if (profile.avatar === null) {
    const index =
      !profile.discriminator || profile.discriminator === "0"
        ? Number((BigInt(profile.id) >> BigInt(22)) % BigInt(6))
        : Number.parseInt(profile.discriminator, 10) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  const format = profile.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
}

/** Ámbitos de OAuth: solo `identify`, y `guilds.members.read` si hay que comprobar el servidor. */
export function discordScopes(guildId: string | undefined): string[] {
  return guildId ? ["identify", "guilds.members.read"] : ["identify"];
}

export async function fetchDiscordProfile(accessToken: string): Promise<DiscordProfile | null> {
  const response = await fetch(`${API}/users/@me`, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  return (await response.json()) as DiscordProfile;
}

/**
 * ¿Es miembro del servidor? true / false, o null si no se ha podido saber
 * (sin permiso, Discord no responde…). Nunca lanza errores.
 */
export async function checkGuildMember(accessToken: string, guildId: string): Promise<boolean | null> {
  try {
    const response = await fetch(`${API}/users/@me/guilds/${encodeURIComponent(guildId)}/member`, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    });
    if (response.ok) return true;
    // 404 «Unknown Guild»: no es miembro.
    if (response.status === 404) return false;
    return null;
  } catch {
    return null;
  }
}
