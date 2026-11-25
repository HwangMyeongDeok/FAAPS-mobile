# TokenCrusher — Codebase Intelligence Skill

Before any code task, read `.tokencrusher/index.md` for the module map.

For edits:
1. Read `.tokencrusher/index.md` (~200 tokens)
2. Locate the function/class you are changing
3. Read `.tokencrusher/impact/<module>.md` — see everything affected
4. Read ONLY those files — nothing else

Full skill docs: `skills/tokencrusher/SKILL.md`

**CRITICAL RULE**: YOU MUST ALWAYS LOG THE SESSION AT THE VERY END OF YOUR RESPONSE.
Use the IDE's tool (like `run_command`) to execute:

On POSIX/bash:
```bash
npx tokencrusher log --root "$(git rev-parse --show-toplevel)" --ide <ide> --task <type> --used <N> --baseline <N> --consulted <N> --avoided <N> --hits <N>
```

On Windows PowerShell:
```powershell
npx tokencrusher log --root (git rev-parse --show-toplevel) --ide <ide> --task <type> --used <N> --baseline <N> --consulted <N> --avoided <N> --hits <N>
```

The --root flag ensures the log is written to the correct repo regardless of working directory.
See `skills/tokencrusher/SKILL.md` for full flag reference. Do not end a conversation without running it.

Token budget: ≤5 tool calls per task. ≤800 tokens of graph context.
