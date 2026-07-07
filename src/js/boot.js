"use strict";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function bootLine(label) {
  print(`<span class="c-dim">[</span><span class="c-user">  OK  </span>` +
        `<span class="c-dim">]</span> ${label}`);
}

async function boot() {
  await loadManifest();
  await loadFiles(FS);

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