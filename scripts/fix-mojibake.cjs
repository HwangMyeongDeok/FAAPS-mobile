const fs = require("fs");
const path = require("path");

/**
 * Repairs UTF-8 text that was read as latin-1 ("Đào tạo" became
 * "Ä<0x90>Ã<0xA0>o tạo").
 *
 * The decoder works byte-wise and greedily: a latin-1 character is only
 * consumed when it starts a *valid* UTF-8 sequence. Characters that are
 * already correct (anything above U+00FF, such as "ạ" or "—") are never
 * touched, so clean text survives untouched.
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

const decoder = new TextDecoder("utf-8", { fatal: true });

function decodeMojibake(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const code = s.charCodeAt(i);
    if (code < 0x80 || code > 0xff) {
      out += s[i];
      i += 1;
      continue;
    }
    let len = 0;
    if (code >= 0xf0) len = 4;
    else if (code >= 0xe0) len = 3;
    else if (code >= 0xc0) len = 2;
    if (len === 0) {
      out += s[i];
      i += 1;
      continue;
    }
    const bytes = [];
    let ok = true;
    for (let k = 0; k < len; k += 1) {
      if (i + k >= s.length) {
        ok = false;
        break;
      }
      const c = s.charCodeAt(i + k);
      if (k === 0) {
        bytes.push(c);
        continue;
      }
      if (c < 0x80 || c > 0xbf) {
        ok = false;
        break;
      }
      bytes.push(c);
    }
    if (ok) {
      try {
        out += decoder.decode(new Uint8Array(bytes));
        i += len;
        continue;
      } catch {
        /* fall through */
      }
    }
    out += s[i];
    i += 1;
  }
  return out;
}

const files = [];
for (const r of roots) if (fs.existsSync(r)) walk(r, files);

let fixed = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const next = decodeMojibake(raw);
  if (next !== raw) {
    fs.writeFileSync(f, next, "utf8");
    fixed += 1;
    console.log("repaired", f);
  }
}
console.log("total repaired:", fixed);
