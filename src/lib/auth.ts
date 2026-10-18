import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
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

/**
 * Inicio de sesión: solo Discord, con el ámbito `identify` (sin correo).
 * Variables: BETTER_AUTH_SECRET, BETTER_AUTH_URL, DISCORD_CLIENT_ID y DISCORD_CLIENT_SECRET.
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
      scope: ["identify"],
      // Mantiene al día el nombre y el avatar en cada inicio de sesión.
      overrideUserInfoOnSignIn: true,
      mapProfileToUser: (profile) => ({
        email: placeholderEmail(profile.id),
        emailVerified: false,
      }),
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
          return { data: { ...user, discordId } };
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
