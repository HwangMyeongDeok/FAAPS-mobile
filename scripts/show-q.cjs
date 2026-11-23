const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Prints every line containing "?" in the working copy, for the files the
 * loss-check flagged, so each one can be eyeballed.
 */

const files = process.argv.slice(2);
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const work = fs.readFileSync(f, "utf8").split("\n");
  work.forEach((line, i) => {
    if (line.includes("?")) console.log(`${f}:${i + 1}: ${line}`);
  });
}
