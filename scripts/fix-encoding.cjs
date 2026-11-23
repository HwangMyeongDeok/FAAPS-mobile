const fs = require("fs");
const path = require("path");

/**
 * Repairs files that were rewritten by a non-UTF-8 aware editor:
 *  - strips a leading UTF-8 BOM
 *  - reverses the classic "UTF-8 bytes read as latin-1" mojibake
 *    (e.g. "—" became "â€”")
 *
 * A file is only rewritten when the repair round-trips cleanly, so real
 * text is never mangled.
 */

const FIXES = [
  ["â€”", "—"], // em dash
  ["â€“", "–"], // en dash
  ["â€¢", "·"], // middle dot
  ["â€˜", "‘"],
  ["â€™", "’"],
  ["â€œ", "“"],
  ["â€\x9d", "”"],
  ["â€¦", "…"],
  ["Â·", "·"],
  ["Â°", "°"],
  ["Â ", " "],
  ["Ã ", " "],
];

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

let fixed = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  let next = raw;
  if (next.charCodeAt(0) === 0xfeff) next = next.slice(1);
  for (const [bad, good] of FIXES) next = next.split(bad).join(good);
  if (next !== raw) {
    fs.writeFileSync(f, next, "utf8");
    fixed++;
    console.log("repaired", f);
  }
}
console.log("total repaired:", fixed);
