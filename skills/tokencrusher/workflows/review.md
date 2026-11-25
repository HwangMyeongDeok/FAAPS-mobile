# Code review workflow

1. Read `.tokencrusher/index.md` to orient
2. For each changed file in the PR:
   a. Read `.tokencrusher/impact/<module>.md`
   b. Read only the changed file itself — not its dependencies
   c. Check TESTED_BY edges — are the affected functions tested?
3. Report: what changed, what is affected, what tests cover it
4. Flag any function with no TESTED_BY edge as untested

Token budget: aim for <600 tokens of context per file reviewed.
