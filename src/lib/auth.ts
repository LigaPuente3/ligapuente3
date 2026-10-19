import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import type { DiscordProfile as BetterAuthDiscordProfile } from "better-auth/social-providers";
import { prisma } from "@/lib/db";
import { checkGuildMember, discordAvatarUrl, discordScopes, fetchDiscordProfile } from "@/lib/discord";
import { discordIdFromPlaceholder, placeholderEmail } from "@/lib/roles";
import { site } from "@/lib/site";

/** Los tokens de Discord no se usan después de iniciar sesión: no se guardan. */
const withoutOAuthTokens = <T extends object>(account: T) => ({
  ...account,
  accessToken: null,
  refreshToken: null,
  idToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
});

/** Servidor de Discord de la comunidad. Vacío = no se exige pertenecer a él. */
const guildId = process.env.DISCORD_GUILD_ID?.trim() || undefined;

/**
 * Resultado de la comprobación del servidor para usuarios que se están creando
 * en esta misma petición (el hook de creación lo recoge). Caduca enseguida.
 */
const pendingGuildChecks = new Map<string, { member: boolean | null; at: number }>();

/**
 * Inicio de sesión: solo Discord, con el ámbito `identify` (sin correo) y, si hay
 * servidor configurado, `guilds.members.read` para saber si es miembro.
 * Variables: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
 * y, opcional, DISCORD_GUILD_ID.
 */
export const auth = betterAuth({
  appName: site.name,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  telemetry: { enabled: false },
  emailAndPassword: { enabled: false },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      disableDefaultScope: true,
      scope: discordScopes(guildId),
      // Mantiene al día el nombre y el avatar en cada inicio de sesión.
      overrideUserInfoOnSignIn: true,
      getUserInfo: async (token) => {
        if (!token.accessToken) return null;
        const profile = await fetchDiscordProfile(token.accessToken);
        if (!profile) return null;

        if (guildId) {
          // Lo opcional nunca rompe lo principal: si falla, se guarda como «sin comprobar».
          const member = await checkGuildMember(token.accessToken, guildId);
          pendingGuildChecks.set(profile.id, { member, at: Date.now() });
          try {
            await prisma.user.updateMany({
              where: { discordId: profile.id },
              data: { guildMember: member, guildCheckedAt: new Date() },
            });
          } catch (error) {
            console.error("guild check update", error);
          }
        }

        return {
          user: {
            name: profile.global_name || profile.username || "",
            email: placeholderEmail(profile.id),
            emailVerified: false,
            image: discordAvatarUrl(profile),
          },
          // Solo usamos id, nombre y avatar; el resto del perfil no se guarda.
          data: profile as unknown as BetterAuthDiscordProfile,
        };
      },
    },
  },
  user: {
    additionalFields: {
      // Lo rellena el hook de creación a partir del correo ficticio (Better Auth
      // descarta los campos `input: false` que llegan desde el perfil).
      discordId: { type: "string", required: false, input: false },
      role: { type: "string", required: false, defaultValue: "PLAYER", input: false },
    },
  },
  session: {
    // Evita consultar la base de datos en cada petición (el rol se refresca en ≤ 5 min).
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const discordId = discordIdFromPlaceholder(user.email);
          // Solo se crean usuarios que entran con Discord.
          if (!discordId) return false;
          const check = pendingGuildChecks.get(discordId);
          pendingGuildChecks.delete(discordId);
          const guild =
            check && Date.now() - check.at < 60_000 ? { guildMember: check.member, guildCheckedAt: new Date() } : {};
          return { data: { ...user, discordId, ...guild } };
        },
      },
    },
    account: {
      create: { before: async (account) => ({ data: withoutOAuthTokens(account) }) },
      update: { before: async (account) => ({ data: withoutOAuthTokens(account) }) },
    },
  },
  plugins: [nextCookies()],
});
