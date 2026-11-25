@./skills/tokencrusher/SKILL.md

Before any code task, read .tokencrusher/index.md first.

**CRITICAL RULE**: YOU MUST ALWAYS LOG THE SESSION AT THE VERY END OF YOUR RESPONSE.
On POSIX: npx tokencrusher log --root "$(git rev-parse --show-toplevel)" --ide antigravity --task <type> --used <N> --baseline <N> --consulted <N> --avoided <N> --hits <N>
On Windows PowerShell: npx tokencrusher log --root (git rev-parse --show-toplevel) --ide antigravity --task <type> ...
Do not end a conversation without running it.
