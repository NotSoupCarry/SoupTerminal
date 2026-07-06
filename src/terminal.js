"use strict";

/* ------------------------------------------------------------
   1. VIRTUAL FILESYSTEM
   ------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   2. COMMAND REGISTRY
   ------------------------------------------------------------ */
const COMMANDS = {
  help: {
    desc: "show this list",
    run: () => "Commands Available:\n" +
      Object.entries(COMMANDS)
        .map(([n, c]) => `  <span class="c-acc">${n.padEnd(10)}</span> ${c.desc}`)
        .join("\n")
  },

  ls: {
    desc: "list files",
    run: () => {
      const node = resolve(CWD);
      if (!isDir(node)) return "";
      return Object.keys(node)
        .map(k => isDir(node[k]) ? `<span class="c-path">${k}/</span>` : k)
        .join("   ");
    }
  },

  cd: {
    desc: "change directory (cd .. to go up)",
    run: (args) => {
      const target = args[0];
      if (!target || target === "~" || target === "/") { CWD = []; return ""; }
      if (target === "..") { CWD.pop(); return ""; }
      const node =      resolve([...CWD, target]);
      if (!node)        return err(`cd: ${target}: file or folder not found`);
      if (!isDir(node)) return err(`cd: ${target}: not a directory`);
      CWD.push(target);
      return "";
    }
  },

  cat: {
    desc: "print the content of a file",
    run: (args) => {
      if (!args[0]) return err("cat: missing file name");
      const node = resolve([...CWD, args[0]]);
      if (node == null) return err(`cat: ${args[0]}: file not found`);
      if (isDir(node))  return err(`cat: ${args[0]}: is a directory`);
      return node;
    }
  },

  tree: {
    desc: "show the file tree",
    run: () => {
      const walk = (node, prefix = "") => {
        const keys = Object.keys(node);
        return keys.map((k, i) => {
          const last = i === keys.length - 1;
          const branch = last ? "└── " : "├── ";
          const line = prefix + branch +
            (isDir(node[k]) ? `<span class="c-path">${k}/</span>` : k);
          const child = isDir(node[k])
            ? "\n" + walk(node[k], prefix + (last ? "    " : "│   "))
            : "";
          return line + child;
        }).join("\n");
      };
      return "<span class=\"c-path\">.</span>\n" + walk(resolve(CWD));
    }
  },

  pwd:    { desc: "print current path",           run: () => cwdString() },
  echo:   { desc: "print text",                   run: (a) => a.join(" ") },
  date:   { desc: "print date and time",          run: () => new Date().toString() },
  clear:  { desc: "clear screen",                 run: () => { out.innerHTML = ""; return ""; } },

  history: {
    desc: "show command history",
    run: () => history.map((h, i) => `${String(i + 1).padStart(3)} - ${h}`).join("\n")
  },

  soup: {
    desc: "Damn I love soup",
    run: () => "Hello I love to l.a.r.p"
  },

  fastfetch: {
      desc: "Print system info",
      run: () =>
 `<span class="c-host">        /\\</span>        <span class="c-user">guest</span>@<span class="c-host">soup</span>
  <span class="c-host">     /  \\</span>       ──────────
  <span class="c-host">    /    \\</span>      <span class="c-acc">OS</span>     SoupOS
  <span class="c-host">   /      \\</span>     <span class="c-acc">Shell</span>  soupsh 1.0
  <span class="c-path">  /   ,,   \\</span>    <span class="c-acc">Term</span>   SoupTerminal
  <span class="c-path"> /   |  |   \\</span>   <span class="c-acc">CPU</span>    Soup(R) Core(TM) i7-9750H CPU @ 2.60GHz
  <span class="c-path">/_-''    ''-_\\</span>  <span class="c-acc">Uptime</span> ${Math.floor(performance.now() / 1000)}s \n\n`
    }
};

/* ------------------------------------------------------------
   3. MOTORE (I/O, prompt, parser, tastiera)
   ------------------------------------------------------------ */
const out       = document.getElementById("output");
const inputLine = document.getElementById("inputLine");
const promptEl  = document.getElementById("prompt");
const typedEl   = document.getElementById("typed");
const cmdline   = document.getElementById("cmdline");

const history = [];
let histIndex = 0;

function print(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  out.appendChild(div);
  window.scrollTo(0, document.body.scrollHeight);
}

function typeOut(text, speed = 12, className = "") {
  return new Promise(resolve => {
    const div = document.createElement("div");
    if (className) div.className = className;
    out.appendChild(div);
    let i = 0;
    (function tick() {
      div.textContent = text.slice(0, i++);
      window.scrollTo(0, document.body.scrollHeight);
      if (i <= text.length) setTimeout(tick, speed);
      else resolve();
    })();
  });
}

function renderPrompt() {
  promptEl.innerHTML =
    `<span class="c-user">guest</span>@<span class="c-host">soup</span> ` +
    `<span class="c-path">${cwdString()}</span> $ `;
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
}

function execute(raw) {
  const line = raw.trim();
  print(promptEl.innerHTML + `<span>${escapeHtml(raw)}</span>`);   // eco nello storico
  if (line === "") return;
  history.push(line);
  histIndex = history.length;

  const [name, ...args] = line.split(/\s+/); 
  const cmd = COMMANDS[name];

  if (!cmd) {
    print(err(`command: ${name} not found`) + ` — try <span class="c-acc">help</span>`);
    return;
  }
  const result = cmd.run(args);
  if (result) print(result);
}

function setLine(text) {
  cmdline.value = text;
  typedEl.textContent = text;
  requestAnimationFrame(() => cmdline.setSelectionRange(text.length, text.length));
}

cmdline.addEventListener("input", () => { typedEl.textContent = cmdline.value; });

// tasti speciali
cmdline.addEventListener("keydown", (e) => {
  // INVIO
  if (e.key === "Enter") {
    execute(cmdline.value);
    setLine("");
    renderPrompt();
    return;
  }
  // HISTORY
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (histIndex > 0) { histIndex--; setLine(history[histIndex]); }
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (histIndex < history.length - 1) { histIndex++; setLine(history[histIndex]); }
    else { histIndex = history.length; setLine(""); }
    return;
  }
  // TAB autocomplete
  if (e.key === "Tab") {
    e.preventDefault();
    const val   = cmdline.value;
    const parts = val.split(/\s+/);
    const frag  = parts[parts.length - 1];
    const pool  = parts.length === 1
      ? Object.keys(COMMANDS)
      : Object.keys(resolve(CWD) || {});
    const matches = pool.filter(x => x.startsWith(frag));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      setLine(parts.join(" "));
    } else if (matches.length > 1) {
      print(promptEl.innerHTML + escapeHtml(val));
      print(matches.join("   "));
    }
    return;
  }
  // CTRL+L pulisce ; CTRL+C annulla
  if (e.ctrlKey && e.key === "l") { e.preventDefault(); out.innerHTML = ""; return; }
  if (e.ctrlKey && e.key === "c") {
    e.preventDefault();
    print(promptEl.innerHTML + escapeHtml(cmdline.value) + "^C");
    setLine("");
    return;
  }
});

document.addEventListener("click", () => cmdline.focus());

/* ------------------------------------------------------------
   4. BOOT SEQUENCE
   ------------------------------------------------------------ */
const sleep = ms => new Promise(r => setTimeout(r, ms));

// riga di boot con status [  OK  ] verde a sinistra
function bootLine(label) {
  print(`<span class="c-dim">[</span><span class="c-user">  OK  </span>` +
        `<span class="c-dim">]</span> ${label}`);
}

async function boot() {
  const steps = [
    "Mounting virtual filesystem",
    "Cooking the soup",
    "Starting soupsh service",
    "Checking for soup Hunger",
    "Putting the salt",
    "Loading command registry",
    "Checking for salt",
    "Starting ubuntu server",
    "Killing all microslop services",
    "Yes the salt is OK",
    "Warming up CRT phosphors",
    "Opening session for guest",
  ];
  for (const s of steps) {
    bootLine(s);
    await sleep(90 + Math.random() * 300);
  }
  await sleep(1);

  out.innerHTML = "";    

  const banner =
`Hello World!
 ____                  _____                   _             _ 
/ ___|  ___  _   _ _ _|_   _|__ _ __ _ __ ___ (_)_ __   __ _| |
\\___ \\ / _ \\| | | | '_ \\| |/ _ \\ '__| '_ \` _ \\| | '_ \\ / _\` | |
 ___) | (_) | |_| | |_) | |  __/ |  | | | | | | | | | | (_| | |
|____/ \\___/ \\__,_| .__/|_|\\___|_|  |_| |_| |_|_|_| |_|\\__,_|_|
                  |_|                                          `;
  await typeOut(banner, 2, "c-acc");

  const now = new Date().toLocaleString("it-IT",
    { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  print(`<span class="c-dim">Last login: ${now} on ttys001</span>`);

  inputLine.hidden = false;
  renderPrompt();
  cmdline.focus();
}

boot();