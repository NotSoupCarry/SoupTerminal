"use strict";

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
