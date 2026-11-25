# Node types reference

TokenCrusher's graph contains five node types, each representing a distinct structural element.

| Node type | Description | Detected by |
|---|---|---|
| `File` | A source file | Always — one per parsed file |
| `Class` | A class or struct definition | Language-specific: `class`, `struct`, `enum` |
| `Function` | A function or method | Language-specific: `function`, `def`, `fn`, `func` |
| `Type` | A type alias or interface | TypeScript `interface`, Go `type`, Rust `trait` |
| `Test` | A test function or spec block | Name heuristic (`test_*`, `Test*`) or decorator (`@Test`, `#[test]`) |

## In snapshot files

Each node appears in `snapshots/<file>.md` as:

```
**Functions:**
- `validateToken` (L14–38)
- `requireRole` (L40–62)
```

## In index.md

Nodes are grouped by file and listed as symbol exports:

```
## src/auth/
- middleware.ts → [validateToken, requireRole, rateLimiter]
```
