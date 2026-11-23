const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Flags characters that the latin-1 round-trip destroyed: a non-ASCII
 * character that became a literal "?" in the file.
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

const files = [];
for (const r of roots) if (fs.existsSync(r)) walk(r, files);

let bad = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const lines = raw.split("\n");
  lines.forEach((line, i) => {
    // Suspicious: "?" glued between a non-ASCII-looking token boundary.
    if (/[^\x00-\x7F]/.test(line) === false && /\?\?|\? \)|\("|\?\.|\?,/.test(line)) {
      // only report when the file also contains replacement chars
      if (/[\uFFFD]/.test(raw)) {
        console.log(`SUSPECT ${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
        bad++;
      }
    }
  });
  if (/[\uFFFD]/.test(raw)) {
    console.log("REPLACEMENT-CHAR in", f);
    bad++;
  }
}
console.log("issues:", bad);
