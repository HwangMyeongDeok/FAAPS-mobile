# Impact-perimeter analysis

The impact-perimeter file tells you the **exact change surface** for a module edit —
which files you must read, which tests to run, and which files you can safely skip.

## How to use it

1. Identify the module you are working in from `.tokencrusher/index.md`
2. Read `.tokencrusher/impact/<module>.md`
3. Work only within the files listed under **Directly affected**
4. Run only the tests listed under **Tests to run**
5. Never read files under **Safe to ignore** — they have zero dependency
   path to your change

## The three sections

### Directly affected
Files that import, call, inherit from, or implement something in the changed module.
These are the only files that could break because of your change.

### Tests to run
Test files with `TESTED_BY` edges connecting them to the changed symbols.
Run only these — full test suite runs are expensive and unnecessary.

### Safe to ignore
Every other file in the repository. Confirmed by BFS traversal — no edge
path connects them to the changed module.

## Example

```
# Impact perimeter: src/auth/middleware.ts
_Last change: validateToken modified_

## Directly affected
- src/api/routes/index.ts (calls validateToken)
- src/api/routes/users.ts (calls validateToken)

## Tests to run
- tests/auth.test.ts (covers validateToken, requireRole)
- tests/api/users.test.ts (integration, imports middleware)

## Safe to ignore
All other files (312) — no dependency path to src/auth/middleware.ts
```

In this example, a change to `validateToken` requires reading 2 files and
running 2 test files — not the full 316-file codebase.
