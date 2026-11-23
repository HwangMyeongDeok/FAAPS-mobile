const fs = require("fs");

const f = process.argv[2];
const lineNo = Number(process.argv[3] || 1);
const line = fs.readFileSync(f, "utf8").split("\n")[lineNo - 1];
console.log("text:", line);
console.log(
  "codepoints:",
  [...line].map((c) => c.codePointAt(0).toString(16)).join(" "),
);
