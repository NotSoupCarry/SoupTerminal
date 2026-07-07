// Scarica i README (markdown grezzo) di una LISTA di repo che decidi tu
// e li salva in src/content/projects/<repo>.md, con in coda un link alla repo.
// Lancialo prima di gen-manifest.mjs:
//     node fetch-readmes.mjs && node gen-manifest.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const OWNER = "NotSoupCarry";

// ── REPO LIST ────────────────────────────────────────────
const REPOS = [
  ".dotfiles",
  "SoupTerminal",
  "tchess",
];
// ────────────────────────────────────────────────────────────

const OUT_DIR = "src/content/projects";
const token = process.env.GITHUB_TOKEN;

function safeName(name) {
  return name
    .replace(/^\.+/, "")
    .replace(/[<>:;'"/\\|?*]/g, "")
    .trim() || "unnamed";        
}

async function fetchReadme(fullName) {
  const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: {
      "Accept": "application/vnd.github.raw+json",   // corpo = markdown grezzo
      "User-Agent": "soupterminal-build",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(`${fullName}: HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

await mkdir(OUT_DIR, { recursive: true });

let ok = 0;
for (const entry of REPOS) {
  const fullName = entry.includes("/") ? entry : `${OWNER}/${entry}`;
  const name = safeName(fullName.split("/")[1]);
  try {
    const md = await fetchReadme(fullName);
    // link alla repo in coda (dinamico da owner/repo)
    const content = `${md.trimEnd()}\n\n---\nRepo: https://github.com/${fullName}\n`;
    await writeFile(join(OUT_DIR, `${name}.md`), content);
    console.log(`✓ ${fullName} -> ${OUT_DIR}/${name}.md`);
    ok++;
  } catch (e) {
    console.error(`✗ ${e.message}`);
  }
}
console.log(`\n${ok}/${REPOS.length} README scaricati`);
