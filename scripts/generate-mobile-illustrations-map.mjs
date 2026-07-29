import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const start = html.indexOf("const ILLUSTRATIONS = {");
const end = html.indexOf("function motifBody");

if (start === -1 || end === -1 || end <= start) {
  throw new Error("Could not find the web illustration map in index.html.");
}

const chunk = html.slice(start, end);
const matches = [...chunk.matchAll(/"([^"]+)"\s*:\s*"assets\/illustrations\/([^"]+)"/g)];
const seen = new Set();
const entries = [];

for (const [, key, file] of matches) {
  if (seen.has(key)) continue;
  seen.add(key);
  entries.push([key, file]);
}

const out = [
  "export const ILLUSTRATIONS = {",
  ...entries.map(([key, file]) => `  ${JSON.stringify(key)}: require("./${file}"),`),
  "} as const;",
  "",
].join("\n");

const outFile = path.join(root, "mobile", "assets", "illustrations", "index.ts");
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out, "utf8");

console.log(`Generated ${entries.length} mobile illustration mappings.`);
