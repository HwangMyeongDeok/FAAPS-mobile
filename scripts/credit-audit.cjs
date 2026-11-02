/**
 * Computes the curriculum credit arithmetic straight from the COURSE_SEED
 * table in mockDb.ts, so the numbers written into the mock data and shown
 * on the AI roadmap screen reconcile with the course rows on screen.
 */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(
  path.join(__dirname, "..", "src", "lib", "db", "mockDb.ts"),
  "utf8"
);

const start = src.indexOf("const COURSE_SEED");
// Skip the `: { ... }[]` type annotation — find the array literal that
// follows the `=` sign.
const assign = src.indexOf("=", start);
const open = src.indexOf("[", assign);
let depth = 0;
let end = open;
for (let i = open; i < src.length; i++) {
  if (src[i] === "[") depth++;
  if (src[i] === "]") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const seedSrc = src.slice(open, end);
// Normalise the TS object literal into plain JS: quote bare keys and
// strip the type annotations, then eval it.
const jsSrc = seedSrc
  .replace(/type:\s*"[A-Z]+"/g, 'type: "CORE"')
  .replace(/(\{|,)\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":')
  .replace(/,\s*\}/g, "}");

const seed = eval(`(${jsSrc})`);

const bySem = new Map();
for (const c of seed) {
  if (!bySem.has(c.semester)) bySem.set(c.semester, []);
  bySem.get(c.semester).push(c);
}

let total = 0;
const rows = [];
for (const sem of [...bySem.keys()].sort((a, b) => a - b)) {
  const list = bySem.get(sem);
  const sum = list.reduce((s, c) => s + c.credits, 0);
  const completedFlag = list
    .filter((c) => c.completed)
    .reduce((s, c) => s + c.credits, 0);
  total += sum;
  rows.push({ sem, count: list.length, credits: sum, completedFlag });
}

console.log("semester | courses | credits | (completed flag only)");
for (const r of rows) {
  console.log(
    `   ${r.sem}    |   ${r.count}    |   ${r.credits}   |   ${r.completedFlag}`
  );
}
console.log("TOTAL CREDITS IN CURRICULUM:", total);

/** Credits a student has earned once they are in `currentSemester`. */
function earnedAt(currentSemester) {
  let earned = 0;
  for (const c of seed) if (c.semester < currentSemester) earned += c.credits;
  return earned;
}

for (const cur of [5, 6, 7, 8]) {
  const earned = earnedAt(cur);
  const remaining = total - earned;
  console.log(
    `currentSemester=${cur} -> earned ${earned}, remaining ${remaining}, sum ${earned + remaining}`
  );
}

/** Semester totals for the upcoming semesters from `currentSemester`. */
function remainingBreakdown(currentSemester) {
  const map = new Map();
  for (const c of seed) {
    if (c.semester >= currentSemester) {
      map.set(c.semester, (map.get(c.semester) ?? 0) + c.credits);
    }
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}
console.log("\nremaining by semester @5:", remainingBreakdown(5));
console.log("remaining by semester @7:", remainingBreakdown(7));
