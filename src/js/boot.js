"use strict";

const sleep = ms => new Promise(r => setTimeout(r, ms));

function bootLine(label) {
  print(`<span class="c-dim">[</span><span class="c-user">  OK  </span>` +
        `<span class="c-dim">]</span> ${label}`);
}

async function boot() {
  cmdline.disabled = true;

  await loadManifest();
  await loadFiles(FS);

  const steps = [
    "Mounting virtual filesystem",
    "Cooking the soup",
    "Starting soupsh service",
    "Checking for Soup & Hunger",
    "But it refused </3...",  
    "Putting the salt",
    "Forget it! There’s no way you’re taking Kairi’s heart!",
    "Loading command registry",
    "Checking for salt",
    "Sora, what is like to be the Choujin X?...",
    "Starting ubuntu server",
    "Killing all microslop services",
    "SET YOUR HEART ABLAZE",
    "Yes the salt is OK",
    "No one is around to help",
    "Life is hard life is stressful",
    "I need peace and tranquility",
    "Warming up CRT phosphors",
    "Opening session for guest...",
    "He became... A God",
  ];
  for (const s of steps) {
    bootLine(s);
    await sleep(90 + Math.random() * 300);
  }
  await sleep(1500);

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

  cmdline.disabled = false;
  inputLine.hidden = false;
  renderPrompt();
  cmdline.focus();
}

boot();