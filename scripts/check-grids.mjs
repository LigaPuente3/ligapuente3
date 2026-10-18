// Uso: npm run check:grids (también se ejecuta dentro de npm run lint).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { findMissingBaseGrid } from "./grid-check.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mdx"];

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext)) && !entry.name.includes(".test.")) yield path;
  }
}

let failures = 0;
for (const file of walk(join(ROOT, "src"))) {
  for (const problem of findMissingBaseGrid(readFileSync(file, "utf8"))) {
    failures++;
    console.error(`${relative(ROOT, file)}:${problem.line}  falta grid-cols base → "${problem.text}"`);
  }
}

if (failures > 0) {
  console.error(`\ncheck:grids: ${failures} rejilla(s) sin columna base. Añade p. ej. grid-cols-1.`);
  process.exit(1);
}
console.log("check:grids: OK");
