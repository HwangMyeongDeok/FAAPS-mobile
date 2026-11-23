const fs = require("fs");
const path = require("path");

const MAP = {
  "#F36F21": "#F37021",
  "#B5460D": "#B45309",
  "#EAE1D8": "#E5E7EB",
  "#F3EDE6": "#E5E7EB",
  "#FAF7F4": "#FAFAFA",
  "#191512": "#1A1A1A",
  "#6A6058": "#6B7280",
  "#8B8178": "#6B7280",
  "#F2EDE7": "#F3F4F6",
  "#12100E": "#121212",
  "#DC2626": "#EF4444",
  "#0F7A4D": "#10B981",
  "#C2410C": "#EF4444",
  "#059669": "#10B981",
};

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

let changed = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  let next = raw;
  for (const [k, v] of Object.entries(MAP)) next = next.split(k).join(v);
  if (next !== raw) {
    fs.writeFileSync(f, next, "utf8");
    changed++;
    console.log("updated", f);
  }
}
console.log("total changed:", changed);
