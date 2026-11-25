# Edge types reference

TokenCrusher's graph uses seven edge types to encode how code elements relate to each other.

| Edge type | Direction | Description | Impact-perimeter role |
|---|---|---|---|
| `CALLS` | A → B | Function A calls function B | Inbound callers are always in impact perimeter |
| `IMPORTS_FROM` | A → B | File A imports from file B | Inbound importers are in impact perimeter |
| `INHERITS` | A → B | Class A inherits from class B | Subclasses affected when parent changes |
| `IMPLEMENTS` | A → B | Class A implements interface B | Implementors affected when interface changes |
| `CONTAINS` | A → B | File/class A contains function/class B | Used to group symbols by file |
| `TESTED_BY` | A → B | Function A is covered by test B | Drives "Tests to run" section of impact file |
| `DEPENDS_ON` | A → B | Module-level package dependency | Top-level dependency propagation |

## Impact-perimeter traversal direction

During BFS, TokenCrusher follows edges **in reverse** — it asks "who depends on this?"

- `CALLS` → find all callers of the changed function
- `IMPORTS_FROM` → find all files that import the changed module
- `INHERITS` → find all subclasses of the changed class
- `IMPLEMENTS` → find all implementors of the changed interface
- `DEPENDS_ON` → find all modules that depend on the changed module
- `TESTED_BY` → find all tests that cover the changed function (forward, not reverse)

## Example chain

```
validateToken (Function)
  ← CALLS from routes/index.ts
  ← CALLS from routes/users.ts
      ← IMPORTS_FROM from app.ts
  → TESTED_BY tests/auth.test.ts
```

Impact perimeter of `validateToken`: routes/index.ts, routes/users.ts, app.ts + auth.test.ts
