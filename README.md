# SoupTerminal

> A personal portfolio that boots, blinks, and talks back — my website disguised as a Linux terminal.

SoupTerminal is a fake-but-convincing terminal that runs entirely in the browser: virtual filesystem, boot sequence, blinking cursor, CRT glow, tab-completion, command history. No framework, no build step for the runtime — just HTML, CSS and vanilla JavaScript. The project pages are pulled straight from my GitHub READMEs at deploy time, so the site is never out of date.

```
guest@soup ~/ $ help
guest@soup ~/ $ ls
guest@soup ~/ $ cd projects && cat SoupTerminal.md
guest@soup ~/ $ fastfetch
```

## Features

- **Virtual filesystem** — `ls`, `cd`, `cat`, `tree`, `pwd` over a fake directory tree.
- **Real terminal feel** — command history (`↑`/`↓`), `Tab` autocompletion, `Ctrl+L` to clear, `Ctrl+C` to cancel, blinking cursor.
- **Boot sequence** — a fake `[  OK  ]` service log, then a typed ASCII banner and a `Last login` line.
- **CRT aesthetic** — scanlines, phosphor glow and a colored `guest@soup` prompt.
- **`fastfetch`** — system info panel next to an Arch Linux logo.
- **Dynamic content** — text files and project pages are fetched at runtime, not hardcoded.
- **Zero dependencies** — the terminal itself is plain JS; the only tooling is two small Node scripts used at build time.

## Commands

| Command | Description |
|---|---|
| `help` | list the available commands |
| `ls [-a] [-l] [dir]` | list files (`-a` shows hidden, `-l` long format) |
| `cd <dir>` | change directory (`cd ..` to go up) |
| `cat <file>` | print a file's content |
| `tree` | show the file tree |
| `pwd` | print the current path |
| `echo <text>` | print text back |
| `date` | print date and time |
| `history` | show typed commands |
| `clear` | clear the screen |
| `fastfetch` | print system info |
| `reboot` | restart the terminal |
| `soup` | special content |

## How it works

The runtime is split into four scripts, loaded in order and sharing a single global scope:

- **`filesystem.js`** — the virtual filesystem plus navigation helpers, and the loaders that build it from a manifest.
- **`commands.js`** — the command registry. Adding a command is just one entry: `{ desc, run(args) }`.
- **`engine.js`** — the I/O engine: printing, the prompt, the keyboard handling, the parser.
- **`boot.js`** — the startup sequence; it runs `boot()` on load.

At boot the terminal fetches `manifest.json` (a tree of file paths), builds the filesystem from it, then downloads each file's content. Because everything is fetched, **content lives in real files**, not inside the JavaScript.

### Content & the manifest

Files under `src/content/` are the site's content. A tiny Node script scans that folder and writes the manifest, so you never hand-write paths:

```bash
node utils/gen-manifest.mjs      # regenerate the manifest after adding/renaming files
```

### Project pages from GitHub

Project pages are the READMEs of selected repositories, fetched at deploy time. Edit the `REPOS` list in `utils/fetch-readmes.mjs`, and each README is saved into `src/content/projects/` with a "go to repo" link appended automatically:

```bash
node utils/fetch-readmes.mjs && node utils/gen-manifest.mjs
```

## Project structure

```
.
├── index.html
├── src/
│   ├── style.css
│   ├── js/
│   │   ├── filesystem.js
│   │   ├── commands.js
│   │   ├── engine.js
│   │   └── boot.js
│   └── content/
│       ├── about.txt
│       ├── contacts.txt
│       └── projects/        # generated from GitHub READMEs
├── utils/
│   ├── manifest.json        # generated
│   ├── gen-manifest.mjs
│   └── fetch-readmes.mjs
└── .github/workflows/deploy.yml
```

## Running locally

The terminal uses `fetch`, which browsers block over `file://`. Serve the folder over HTTP instead of double-clicking `index.html`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Deployment is automated with GitHub Actions to GitHub Pages. On every push to `main` the workflow:

1. fetches the project READMEs (`fetch-readmes.mjs`),
2. regenerates the manifest (`gen-manifest.mjs`),
3. publishes the site to Pages.

No secrets to configure — the built-in `GITHUB_TOKEN` is enough to read public repos. Just set **Settings → Pages → Source → GitHub Actions** once.

## Built with

Vanilla HTML, CSS and JavaScript. Node (ESM) for the build scripts. GitHub Actions + Pages for deploy.

---

Made with too much soup by [NotSoupCarry](https://github.com/NotSoupCarry).