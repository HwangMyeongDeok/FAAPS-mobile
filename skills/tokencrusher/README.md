# TokenCrusher Skill

TokenCrusher builds a local knowledge graph of your codebase and writes compact markdown snapshots that AI agents read instead of raw source files — achieving **6.8–49× token reduction**.

## How it works

1. `tokencrusher build` parses your codebase with Tree-sitter and stores a knowledge graph in `.tokencrusher/graph.db`
2. The graph engine writes compact snapshots to `.tokencrusher/`
3. The SKILL.md instructs AI agents to read the snapshots first — before any source file

## Snapshot files

| File | Purpose | Size |
|---|---|---|
| `.tokencrusher/index.md` | Full module map — all files, all symbols | ~200 tokens |
| `.tokencrusher/impact/<module>.md` | Impact perimeter for a module | 80–150 tokens |
| `.tokencrusher/snapshots/<file>.md` | Structural summary of one file | 60–100 tokens |

## Skill documents

- [`core/context.md`](./core/context.md) — how to read snapshot files
- [`core/impact-perimeter.md`](./core/impact-perimeter.md) — impact analysis workflow
- [`workflows/review.md`](./workflows/review.md) — code review workflow
- [`workflows/refactor.md`](./workflows/refactor.md) — safe refactor workflow
- [`workflows/onboarding.md`](./workflows/onboarding.md) — onboarding workflow
- [`references/node-types.md`](./references/node-types.md) — node type reference
- [`references/edge-types.md`](./references/edge-types.md) — edge type reference

## Rebuilding the graph

```bash
npx tokencrusher build    # full rebuild (~10s for 500 files)
npx tokencrusher update   # incremental update (<2s per changed file)
npx tokencrusher status   # graph health summary
```
