"use strict";


const FS = {
  "about.txt":
    "Giuseppe — Full-Stack Developer.\n" +
    "TypeScript / Next.js / Node — e un debole per Go e Arch Linux.\n" +
    "Prova: projects, whoami, neofetch",
  "contatti.txt":
    "email : tu@example.com\n" +
    "github: github.com/tuo-utente\n" +
    "site  : tuo-sito.dev",
  progetti: {
    "tuffgramma.md":
      "TUFFGramma — gioco di parole (React + Spring Boot + Python).\n" +
      "Deploy su VPS con Kubernetes.",
    "soupterminal.md":
      "SoupTerminal — questo terminale. Meta, no?\n" +
      "È tutto in tre file: guarda il sorgente."
  }
};

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
