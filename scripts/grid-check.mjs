/**
 * Detecta rejillas con columnas solo en breakpoints (p. ej. `sm:grid-cols-2`)
 * sin columna base (`grid-cols-1`), que en móvil se ven mal.
 * Revisa cada literal de texto ("…", '…' o `…`) por separado.
 */

const STRING_LITERAL = /"([^"\\\n]|\\.)*"|'([^'\\\n]|\\.)*'|`([^`\\]|\\.)*`/g;
const RESPONSIVE_COLS = /(?:^|\s)(?:[\w-]+:)*(?:sm|md|lg|xl|2xl):grid-cols-[\w[\]()-]+/;
const BASE_COLS = /(?:^|\s)grid-cols-[\w[\]()-]+/;

/**
 * @param {string} source contenido del archivo
 * @returns {{ line: number, text: string }[]} literales con columnas responsive y sin columna base
 */
export function findMissingBaseGrid(source) {
  const problems = [];
  for (const match of source.matchAll(STRING_LITERAL)) {
    const text = match[0].slice(1, -1);
    if (RESPONSIVE_COLS.test(text) && !BASE_COLS.test(text)) {
      const line = source.slice(0, match.index).split("\n").length;
      problems.push({ line, text: text.trim() });
    }
  }
  return problems;
}
