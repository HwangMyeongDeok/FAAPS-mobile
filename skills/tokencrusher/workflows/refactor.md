# Safe refactor workflow

1. Read `.tokencrusher/index.md`
2. Find the function/class to refactor in the module map
3. Read `.tokencrusher/impact/<module>.md` — this is your change surface
4. Read ONLY the files listed under "Directly affected"
5. Make the change
6. Verify: re-read the impact file and confirm all callers are updated
7. Run only the tests listed under "Tests to run"

Do not read files listed under "Safe to ignore" — they have no
dependency path to your change.
