const fs = require("fs");
const path = require("path");

/**
 * Lists every line that still shows mojibake: a latin-1 "lead" character
 * followed by a character in the U+0080–U+017F range (the classic
 * "Ã¡", "Ä<0x90>", "Æ°" signatures).
 */

const roots = ["src", "app"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(e.name))) out.push(p);
  }
}

const SIG = /[ÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØÙÚÛÜÝĐ][\u0080-\u024F]/;

const files = [];
for (const r of roots) if (fs.existsSync(r)) walk(r, files);

let n = 0;
for (const f of files) {
  fs.readFileSync(f, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (SIG.test(line)) {
        console.log(`${f}:${i + 1}: ${line.trim()}`);
        n += 1;
      }
    });
}
console.log("suspect lines:", n);
