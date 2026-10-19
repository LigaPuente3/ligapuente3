import type { DivisionTier, Zone } from "@/lib/league";

/**
 * Clases de color por división (colores de rareza de las cartas). Escritas
 * completas para que Tailwind las detecte.
 */
export const tierBadgeClass: Record<DivisionTier, string> = {
  LEGENDARY: "bg-tier-legendary text-bg",
  RARE: "bg-tier-rare text-bg",
  UNCOMMON: "bg-tier-uncommon text-bg",
  COMMON: "bg-tier-common text-text",
};

const zoneRowClass = {
  champion: "border-l-4 border-l-tier-champion bg-tier-champion/15",
  LEGENDARY: "border-l-4 border-l-tier-legendary bg-tier-legendary/15",
  RARE: "border-l-4 border-l-tier-rare bg-tier-rare/15",
  UNCOMMON: "border-l-4 border-l-tier-uncommon bg-tier-uncommon/15",
  COMMON: "border-l-4 border-l-tier-common bg-tier-common/20",
} as const;

const zoneDotClass = {
  champion: "bg-tier-champion",
  LEGENDARY: "bg-tier-legendary",
  RARE: "bg-tier-rare",
  UNCOMMON: "bg-tier-uncommon",
  COMMON: "bg-tier-common",
} as const;

function key(zone: Exclude<Zone, null>): keyof typeof zoneRowClass {
  return zone.kind === "champion" ? "champion" : zone.to;
}

/** Fila de la clasificación: borde y fondo del color de la división a la que va. */
export function zoneRow(zone: Zone): string {
  return zone ? zoneRowClass[key(zone)] : "border-l-4 border-l-transparent";
}

/** Punto de color para la leyenda. */
export function zoneDot(zone: Exclude<Zone, null>): string {
  return zoneDotClass[key(zone)];
}
