import pkg from "../../package.json";

/**
 * Configuración que depende de quién gestione la web.
 * Todo sale de variables de entorno (ver .env.example): traspasar la web
 * es cambiar estas variables, no el código.
 */

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function siteUrl(): string {
  const explicit = env("SITE_URL");
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelProduction = env("VERCEL_PROJECT_PRODUCTION_URL");
  if (vercelProduction) return `https://${vercelProduction}`;
  return "http://localhost:3100";
}

export const site = {
  name: env("SITE_NAME") ?? "LigaPuente3",
  communityName: env("COMMUNITY_NAME") ?? "puente3",
  url: siteUrl(),
  contactEmail: env("CONTACT_EMAIL"),
  legalControllerName: env("LEGAL_CONTROLLER_NAME"),
  repoUrl: env("REPO_URL"),
  version: pkg.version,
};

export type Site = typeof site;
