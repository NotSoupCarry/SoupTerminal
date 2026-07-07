"use strict";

function parseArgs(args) {
  const flags = new Set();
  const positional = [];
  for (const a of args) {
    if (a.startsWith("-") && a.length > 1) {
      for (const ch of a.slice(1)) flags.add(ch);
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

const COMMANDS = {
  help: {
    desc: "show this list",
    run: () => "Commands Available:\n" +
      Object.entries(COMMANDS)
        .map(([n, c]) => `  <span class="c-acc">${n.padEnd(10)}</span> ${c.desc}`)
        .join("\n")
  },

  ls: {
    desc: "list files (-a all, -l long)",
    run: (args) => {
      const { flags, positional } = parseArgs(args);
      const base = positional[0] ? [...CWD, positional[0]] : CWD;
      const node = resolve(base);
      if (node == null)  return err(`ls: ${positional[0]}: not found`);
      if (!isDir(node))  return positional[0];

      let names = Object.keys(node);
      if (!flags.has("a")) names = names.filter(k => !k.startsWith("."));
      if (flags.has("a"))  names = [".", "..", ...names];

      const isDirEntry = k => k === "." || k === ".." || isDir(node[k]);
      const decorate = k => {
        if (k === "." || k === "..") return `<span class="c-path">${k}</span>`;
        return isDir(node[k]) ? `<span class="c-path">${k}/</span>` : k;
      };

      if (flags.has("l")) {
        return names.map(k => {
          const dir  = isDirEntry(k);
          const mode = dir ? "drwxr-xr-x" : "-rw-r--r--";
          const size = dir ? 4096 : String(node[k]).length;
          return `${mode}  guest guest ${String(size).padStart(5)}  1 Jan 00:00  ${decorate(k)}`;
        }).join("\n");
      }
      return names.map(decorate).join("   ");
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

  pwd:    { desc: "print current path",  run: () => cwdString() },
  echo:   { desc: "print text",          run: (a) => a.join(" ") },
  date:   { desc: "print date and time", run: () => new Date().toString() },
  clear:  { desc: "clear screen",        run: () => { out.innerHTML = ""; return ""; } },

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
