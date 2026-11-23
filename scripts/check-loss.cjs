const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Compares the working copy against HEAD and reports any line where the
 * HEAD version contained a non-ASCII character that is missing now.
 */

const files = execSync("git diff --name-only", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.trim() && fs.existsSync(f));

let issues = 0;
for (const f of files) {
  let head = "";
  try {
    head = execSync(`git show "HEAD:${f}"`, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  } catch {
    continue;
  }
  const work = fs.readFileSync(f, "utf8");
  const headNonAscii = (head.match(/[^\x00-\x7F]/g) || []).length;
  const workNonAscii = (work.match(/[^\x00-\x7F]/g) || []).length;
  const headQ = (head.match(/\?/g) || []).length;
  const workQ = (work.match(/\?/g) || []).length;
  const deltaQ = workQ - headQ;
  if (deltaQ > 0 || workNonAscii < headNonAscii) {
    console.log(
      `${f}\n  head: nonASCII=${headNonAscii} q=${headQ}\n  work: nonASCII=${workNonAscii} q=${workQ}\n  deltaQ=${deltaQ}`,
    );
    issues++;
  }
}
console.log("files with possible loss:", issues);
