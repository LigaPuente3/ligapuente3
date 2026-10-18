/**
 * Ruta interna a la que volver tras iniciar sesión. Solo se aceptan rutas
 * relativas de este sitio ("/algo"), nunca otros dominios ("//x.com", "https://…").
 */
export function safeNextPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}
