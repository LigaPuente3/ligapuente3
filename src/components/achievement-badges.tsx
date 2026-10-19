import { achievementIcons, sortAchievements, type AchievementType } from "@/lib/achievements";
import type { Dictionary } from "@/i18n/es";

/** Iconos de los logros de un jugador (p. ej. 🏆×3). Con nombre accesible. */
export function AchievementBadges({
  achievements,
  dict,
}: {
  achievements: { type: AchievementType; count: number }[];
  dict: Dictionary;
}) {
  if (achievements.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-sm">
      {sortAchievements(achievements).map((a) => {
        const label = `${dict.achievements.names[a.type]}${a.count > 1 ? ` ×${a.count}` : ""}`;
        return (
          <span key={a.type} title={label} className="inline-flex items-center whitespace-nowrap">
            <span aria-hidden="true">{achievementIcons[a.type]}</span>
            {a.count > 1 ? (
              <span aria-hidden="true" className="text-xs text-muted">
                ×{a.count}
              </span>
            ) : null}
            <span className="sr-only">{label}</span>
          </span>
        );
      })}
    </span>
  );
}
