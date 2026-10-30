// One-off: sum the mock curriculum course seed by semester so the Home
// screen's numbers come from the same source as its progress rail.
const fs = require("fs");
const src = fs.readFileSync("src/lib/db/mockDb.ts", "utf8");

const re = /\{ code: "([A-Z0-9]+)",\s*name: "([^"]*)",\s*credits: (\d+), type: "([A-Z]+)",\s*semester: (\d+), completed: (true|false) \}/g;
let m;
const rows = [];
while ((m = re.exec(src))) {
  rows.push({ code: m[1], name: m[2], credits: +m[3], type: m[4], sem: +m[5], done: m[6] === "true" });
}

const bySem = new Map();
for (const r of rows) {
  if (!bySem.has(r.sem)) bySem.set(r.sem, { total: 0, earned: 0, n: 0, doneN: 0 });
  const s = bySem.get(r.sem);
  s.total += r.credits;
  s.n += 1;
  if (r.done) { s.earned += r.credits; s.doneN += 1; }
}

console.log("courses:", rows.length);
console.log("total credits in curriculum:", rows.reduce((s, r) => s + r.credits, 0));
console.log("earned credits (completed):", rows.filter(r => r.done).reduce((s, r) => s + r.credits, 0));
console.log("count completed:", rows.filter(r => r.done).length);
console.log("");
for (const [sem, s] of [...bySem.entries()].sort((a,b)=>a[0]-b[0])) {
  console.log(`K${sem}: total ${s.total} TC | earned ${s.earned} TC | courses ${s.doneN}/${s.n}`);
}
console.log("");
console.log("sem 5 courses:", rows.filter(r=>r.sem===5).map(r=>`${r.code} ${r.name} (${r.credits}TC, ${r.type})`).join("\n  "));
console.log("");
console.log("major total_credits = 150");
