// Scarica i README (markdown grezzo) di una LISTA di repo che decidi tu
// e li salva in src/content/projects/<repo>.md.
// Lancialo prima di gen-manifest.mjs:
//     node fetch-readmes.mjs && node gen-manifest.mjs
// In GitHub Actions usa GITHUB_TOKEN (già disponibile) per il rate limit.

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const OWNER = "NotSoupCarry";

// ── LA TUA LISTA ────────────────────────────────────────────
// Nome del repo (sotto OWNER) oppure "altro-owner/repo" per repo di altri.
const REPOS = [
  "tuffgramma",
  "SoupTerminal",
  // aggiungi qui i repo che vuoi mostrare in /projects
];
// ────────────────────────────────────────────────────────────

const OUT_DIR = "src/content/projects";
const token = process.env.GITHUB_TOKEN;   // presente in Actions; in locale può mancare

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
  const name = fullName.split("/")[1];
  try {
    const md = await fetchReadme(fullName);
    await writeFile(join(OUT_DIR, `${name}.md`), md);
    console.log(`✓ ${fullName} -> ${OUT_DIR}/${name}.md`);
    ok++;
  } catch (e) {
    console.error(`✗ ${e.message}`);
  }
}
console.log(`\n${ok}/${REPOS.length} README scaricati`);
