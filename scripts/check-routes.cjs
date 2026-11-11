/**
 * Route link checker.
 *
 * The QA audit found deep links pointing at routes that do not exist
 * (`/(app)/messages/conv-1`, `/(app)/plan`), which silently dead-ended the
 * user. This script rebuilds the Expo Router tree from `app/` and asserts
 * that every href used in the app code resolves to a
 * real screen.
 *
 * Run with: `npm run check:routes`
 */
const fs = require("fs");
const path = require("path");

const { getStateFromPath } = require("expo-router/build/fork/getStateFromPath");
const { getReactNavigationConfig } = require(
  "expo-router/build/getReactNavigationConfig"
);
const { getRoutes } = require("expo-router/build/getRoutes");

const ROOT = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT, "app");

/** Build a Metro-like require context from the `app/` directory. */
const requireContext = (dir) => {
  const files = [];
  const walk = (d, prefix = "") => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full, `${prefix}${entry.name}/`);
      } else if (/\.[jt]sx?$/.test(entry.name)) {
        files.push(`./${prefix}${entry.name}`);
      }
    }
  };
  walk(dir);
  const map = new Map(files.map((f) => [f, {}]));
  return new Proxy(
    { keys: () => [...map.keys()] },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        return map.get(prop);
      },
    }
  );
};

const routes = getRoutes(requireContext(APP_DIR), {
  platform: "web",
  ignoreEntryPoints: true,
  getSystemRoute: ({ type, route }) => ({
    type,
    route,
    contextKey: route,
    loadRoute: () => ({}),
    children: [],
  }),
});

const config = getReactNavigationConfig(routes, false);

/** Resolve an href to the chain of route names it lands on. */
function resolve(href) {
  const state = getStateFromPath(href, config, []);
  if (!state) return null;
  const names = [];
  let current = state;
  while (current?.routes?.length) {
    const focused = current.routes[current.index ?? current.routes.length - 1];
    names.push(focused.name);
    current = focused.state;
  }
  return names;
}

/** Collect every `href:` / `router.push("...")` literal in the project. */
function collectHrefs() {
  const found = new Map(); // href -> [source]

  const add = (href, source) => {
    if (!href.startsWith("/")) return;
    if (!found.has(href)) found.set(href, []);
    found.get(href).push(source);
  };

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        walk(full);
      } else if (/\.[jt]sx?$/.test(entry.name)) {
        const source = path.relative(ROOT, full);
        const text = fs.readFileSync(full, "utf8");
        for (const m of text.matchAll(/href:\s*"([^"]+)"/g)) add(m[1], source);
        for (const m of text.matchAll(/router\.(?:push|replace|navigate)\(\s*"([^"]+)"/g))
          add(m[1], source);
      }
    }
  };

  walk(path.join(ROOT, "app"));
  walk(path.join(ROOT, "src"));
  return found;
}

let failed = 0;
for (const [href, sources] of collectHrefs()) {
  const names = resolve(href);
  if (names) {
    console.log(`OK    ${href}  ->  ${names.join(" > ")}`);
  } else {
    failed += 1;
    console.log(`BROKEN ${href}  (${sources.join(", ")})`);
  }
}

console.log(
  failed === 0
    ? "\nAll deep links resolve to a real screen."
    : `\n${failed} broken deep link(s).`
);

process.exit(failed === 0 ? 0 : 1);
