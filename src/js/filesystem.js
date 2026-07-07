"use strict";

let FS = {};        
let CWD = [];

function resolve(pathParts) {
  let node = FS;
  for (const part of pathParts) {
    if (part === "" || part === ".") continue;
    if (part === "..") continue;
    if (node && typeof node === "object" && part in node) node = node[part];
    else return null;
  }
  return node;
}
const isDir = n => n && typeof n === "object";
const cwdString = () => "~/" + CWD.join("/");
const err = msg => `<span class="c-err">${msg}</span>`;

async function loadManifest(url = "utils/manifest.json") {
  try {
    const res = await fetch(url);
    if (res.ok) { FS = await res.json(); return; }
    FS = { "ERROR": `(manifest non trovato: ${url})` };
  } catch {
    FS = { "ERROR": "(errore di rete sul manifest)" };
  }
}

async function loadFiles(node) {
  const jobs = Object.entries(node).map(async ([k, v]) => {
    if (isDir(v)) return loadFiles(v);                 
    try {
      const res = await fetch(v);
      node[k] = res.ok ? await res.text() : `(impossibile caricare ${v})`;
    } catch {
      node[k] = `(errore di rete su ${v})`;
    }
  });
  await Promise.all(jobs);                              
}