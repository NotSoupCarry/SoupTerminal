// Scansiona la cartella content/ e scrive content/!manifest.json:
// un albero che rispecchia le cartelle, con i file -> percorso (URL).
//     node gen-manifest.mjs
// (il contenuto dei file non serve rigenerarlo: quello lo legge il browser).

import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "src/content";
const OUT  = join('utils', "manifest.json");

async function walk(dir, urlPrefix) {
  const entries = await readdir(dir, { withFileTypes: true });
  const tree = {};
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name === "manifest.json") continue;     
    const url = `${urlPrefix}/${e.name}`;
    tree[e.name] = e.isDirectory()
      ? await walk(join(dir, e.name), url)
      : url; 
  }
  return tree;
}

const tree = await walk(ROOT, ROOT);
await writeFile(OUT, JSON.stringify(tree, null, 2) + "\n");
console.log(`scritto ${OUT}`);
