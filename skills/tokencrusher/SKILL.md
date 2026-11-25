---
name: tokencrusher
description: >
  Use on every code task in this repository. Reads the local knowledge graph
  in .tokencrusher/ to give you the exact impact perimeter — affected callers,
  tests, and safe-to-ignore files — before touching any source file.
  Reduces AI token consumption by 6.8–49×.
allowed-tools:
  - read_file
  - list_directory
  - search_files
---

# TokenCrusher — Graph-First Workflow

> **CRITICAL RULE**: YOU MUST ALWAYS LOG THE SESSION AT THE VERY END OF YOUR RESPONSE. NEVER END A CONVERSATION WITHOUT RUNNING THE LOGGING COMMAND! (See Step 6)
> **Antigravity IDE**: Use the `run_command` tool to run `tokencrusher log ...` (Step 6) BEFORE writing the Walkthrough or stopping. This is a single CLI command — no complex shell scripting required.

> **Rule**: Never read a source file before consulting the graph.
> Reading code without the graph is 10–49× more expensive.

---

## Step 0: Verify the graph exists

Before any task, check:

```
.tokencrusher/index.md         ← module map (always read this first)
.tokencrusher/impact/<x>.md    ← impact perimeter per module
.tokencrusher/snapshots/<x>.md ← structural summary per file
```

If `.tokencrusher/index.md` does not exist, tell the user to run:
```bash
npx tokencrusher install
```
> **Note**: Use `install`, not just `build`. `install` creates the full `.tokencrusher/` directory structure needed for graph reads **and** session logging (Step 6). Without it, Step 6 writes will silently fail.
> `npx` is used so the command works for both globally-installed users and those who only ran `npx tokencrusher install` once — which is the typical npm workflow.

---

## Step 1: Read the module map (every task, always)

**File**: `.tokencrusher/index.md`
**Token cost**: ~150–250 tokens
**What it gives you**: Every file in the repo, the functions/classes it exports, and which modules import from which.

Read this before anything else. It tells you where to look.

---

## Step 2: Find the impact perimeter of your change

**File**: `.tokencrusher/impact/<module-slug>.md`
**Token cost**: ~80–150 tokens

The module slug is the file path with `/` replaced by `--` and `.` removed.
Example: `src/auth/middleware.js` → `.tokencrusher/impact/src--auth--middleware.md`

The impact file has three sections:

| Section | Meaning |
|---|---|
| **Directly affected** | Files that import, call, or inherit from your change target. Read these. |
| **Tests to run** | Test files wired to your change. Run only these. |
| **Safe to ignore** | Every other file — BFS-confirmed no dependency path. Do NOT read these. |

---

## Step 3: Read ONLY the files in "Directly affected"

Read the source file you are editing plus the files listed under **Directly affected** in the impact file.
Do not read any other files. They are safe to ignore.

If you need a structural overview of a single file without reading its full source:
```
.tokencrusher/snapshots/<file-slug>.md
```
Snapshots contain function names + line numbers at ~60–100 tokens vs the full file.

---

## Step 4: Make the change

You now have the exact context you need. Make the edit.

---

## Step 5: After the change

Run only the tests listed in the impact file's **Tests to run** section.
Do not run the full test suite unless explicitly asked.

---

## Step 6: Log the session (always, at task end)

After **every** completed task, run the following single command in the **project's working directory** (not the TokenCrusher package folder):

**POSIX / bash / zsh / Git Bash:**
```bash
npx tokencrusher log --root "$(git rev-parse --show-toplevel)" --ide antigravity --task <type> --used <tokens_used> --baseline <tokens_baseline> --consulted <files_consulted> --avoided <files_avoided> --hits <graph_hits>
```

**Windows PowerShell:**
```powershell
npx tokencrusher log --root (git rev-parse --show-toplevel) --ide antigravity --task <type> --used <tokens_used> --baseline <tokens_baseline> --consulted <files_consulted> --avoided <files_avoided> --hits <graph_hits>
```

> **Why `--root`?** The `--root` flag pins the write path to the actual repo root, so the command works correctly regardless of which directory the AI runs it from.

### Flag reference

| Flag | Description | Example |
|---|---|---|
| `--root` | Repo root where `.tokencrusher/` lives. Use git root detection. | `$(git rev-parse --show-toplevel)` |
| `--ide` | Your assistant name | `antigravity` |
| `--task` | `review` \| `refactor` \| `onboarding` \| `general` | `refactor` |
| `--used` | Approximate tokens you consumed this task | `820` |
| `--baseline` | Estimated tokens without graph help | `4500` |
| `--consulted` | Source files you actually opened/read | `3` |
| `--avoided` | Files you skipped (safe-to-ignore list) | `9` |
| `--hits` | `.tokencrusher/` graph files you read | `2` |

### Baseline estimate rule

```
tokens_baseline = (files_consulted + files_avoided) × 500
```

500 tokens/file is the conservative average for a typical source file.

### Full example command

```bash
npx tokencrusher log --root "$(git rev-parse --show-toplevel)" --ide antigravity --task refactor --used 820 --baseline 4500 --consulted 3 --avoided 9 --hits 2
```

**Windows PowerShell:**
```powershell
npx tokencrusher log --root (git rev-parse --show-toplevel) --ide antigravity --task refactor --used 820 --baseline 4500 --consulted 3 --avoided 9 --hits 2
```

> **Rules**:
> - Run this command using the `run_command` tool (Antigravity IDE) or terminal. Do NOT just print it.
> - Always include `--root` pointing to the repo root where `.tokencrusher/` lives.
> - On POSIX: `--root "$(git rev-parse --show-toplevel)"`
> - On Windows PowerShell: `--root (git rev-parse --show-toplevel)`
> - Run it at the **end** of the task, after all edits and tests pass.
> - `--session-id` is auto-generated if omitted — you do not need to provide one.

---

## Tool call budget

| Context type | Max tool calls |
|---|---|
| Graph read (index.md + impact) | 2 |
| Source files to read | ≤ 3 |
| Total per task | ≤ 5 |

If you find yourself about to read a 6th file, stop and re-read the impact file.
Anything not in "Directly affected" is safe to skip.

---

## Token budget

| Item | Target |
|---|---|
| index.md | ≤ 300 tokens |
| impact file | ≤ 200 tokens |
| Source files | ≤ 1,500 tokens each |
| **Total context per task** | **≤ 4,000 tokens** |

---

## Workflow shortcuts

| Task type | Start here |
|---|---|
| Code review / PR | `skills/tokencrusher/workflows/review.md` |
| Refactoring a function | `skills/tokencrusher/workflows/refactor.md` |
| Onboarding to a new area | `skills/tokencrusher/workflows/onboarding.md` |
| Understanding edge types | `skills/tokencrusher/references/edge-types.md` |
| Understanding node types | `skills/tokencrusher/references/node-types.md` |

---

## What the graph cannot tell you

- Runtime behavior (only static structure)
- Values of variables
- Network calls or side effects

For these, read the specific source file. But use the impact perimeter first to find the right file.

---

## ✅ End-of-Task Checklist

Before you write the Walkthrough or stop calling tools, check each item:

- [ ] All edits made and saved
- [ ] Only the impact-perimeter tests were run
- [ ] **`npx tokencrusher log --root "$(git rev-parse --show-toplevel)" --ide antigravity --task <type> --used <N> --baseline <N> --consulted <N> --avoided <N> --hits <N>` was executed** ← most commonly skipped!
- [ ] On Windows PowerShell use `--root (git rev-parse --show-toplevel)` instead

> If you have not yet run the `tokencrusher log` command, **stop and do it now** using your `run_command` tool.
