// Audits the roadmap planner: every pending credit is placed exactly once,
// every term sits inside the 14–22 credit band, no course precedes one of
// its prerequisites, and the three regenerate plans really do differ.
//
// The planner is pure TypeScript, so it is compiled on the fly with the
// project's own TypeScript before it is exercised.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const tmp = mkdtempSync(join(tmpdir(), 'faaps-audit-'));
try {
  // ── Compile the planner + the curriculum seed into runnable JS ──────────
  const plannerSrc = readFileSync('src/lib/api/roadmapPlanner.ts', 'utf8');
  writeFileSync(join(tmp, 'roadmapPlanner.ts'), plannerSrc);

  const db = readFileSync('src/lib/db/mockDb.ts', 'utf8');
  const seedStart = db.indexOf('const COURSE_SEED');
  const seedBlock = db.slice(db.indexOf('= [', seedStart) + 3, db.indexOf('];', db.indexOf('= [', seedStart) + 3));

  const courses = [];
  for (const m of seedBlock.matchAll(/\{\s*code:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*credits:\s*(\d+),\s*type:\s*"([^"]+)",\s*semester:\s*(\d+),\s*completed:\s*(true|false)/g)) {
    courses.push({ code: m[1], name: m[2], credits: +m[3], type: m[4], semester: +m[5], completed: m[6] === 'true' });
  }

  // Rebuild the prerequisite ids exactly the way mockDb does.
  const withIds = courses.map((c, i) => ({ ...c, id: 'c' + (i + 1), prerequisites: [] }));
  withIds.forEach((c, idx) => {
    if (c.type === 'CORE' || c.type === 'PROJECT') {
      const earlier = withIds.slice(0, idx).filter((x) => (x.type === 'CORE' || x.type === 'PROJECT') && x.semester < c.semester);
      c.prerequisites = earlier.slice(-2).map((x) => x.id);
    } else if (c.type === 'ELECTIVE') {
      const earlier = withIds.find((x) => x.type === 'CORE' && x.semester < c.semester);
      if (earlier) c.prerequisites = [earlier.id];
    }
  });

  console.log('seed courses:', withIds.length, '| total credits:', withIds.reduce((s, c) => s + c.credits, 0));

  writeFileSync(join(tmp, 'courses.json'), JSON.stringify(withIds.map((c) => ({
    id: c.id,
    course_code: c.code,
    credits: c.credits,
    type: c.type,
    semester: c.semester,
    prerequisites: c.prerequisites,
  }))));

  // ── Compile ───────────────────────────────────────────────────────────────
  const tsc = join('node_modules', 'typescript', 'bin', 'tsc');
  execFileSync(process.execPath, [tsc, '--ignoreConfig', '--target', 'es2022', '--module', 'esnext', '--moduleResolution', 'bundler', '--outDir', tmp, join(tmp, 'roadmapPlanner.ts')], { stdio: 'inherit' });

  const { pathToFileURL } = await import('node:url');
  const { planSemesters, pickPolicy, TERM_CAP, TERM_FLOOR } = await import(pathToFileURL(join(tmp, 'roadmapPlanner.js')).href);
  const plannerCourses = JSON.parse(readFileSync(join(tmp, 'courses.json'), 'utf8'));

  let failures = 0;
  const check = (cond, msg) => { if (!cond) { failures++; console.log('  FAIL ' + msg); } };

  const run = (currentSemester, preferred, targetGpa, note) => {
    const policy = pickPolicy(targetGpa, note);
    return planSemesters({
      courses: plannerCourses,
      currentSemester,
      preferredTerms: preferred,
      termsAvailable: 8 - currentSemester + 1,
      policy,
    });
  };

  for (const currentSemester of [5, 6, 7, 8]) {
    for (const preferred of [2, 3, 4, 5, 8]) {
      for (const [gpa, note] of [[8.5, undefined], [9, undefined], [8.5, 'cân bằng khối lượng mỗi kỳ'], [8.5, 'ưu tiên môn AI']]) {
        const plan = run(currentSemester, preferred, gpa, note);
        const placed = plan.terms.flat();
        const remainingCredits = plannerCourses.filter((c) => c.semester >= currentSemester).reduce((s, c) => s + c.credits, 0);
        const placedCredits = placed.reduce((s, c) => s + c.credits, 0);
        const label = `sem=${currentSemester} want=${preferred} gpa=${gpa} note=${note ?? '-'} policy=${plan.policy} terms=${plan.termsUsed}${plan.compressed ? '(compressed)' : ''}`;

        check(placedCredits === remainingCredits, `${label}: placed ${placedCredits} of ${remainingCredits} credits`);
        check(placed.length === plannerCourses.filter((c) => c.semester >= currentSemester).length, `${label}: wrong number of courses placed`);
        check(new Set(placed.map((c) => c.id)).size === placed.length, `${label}: duplicate course`);

        const termOf = new Map();
        plan.terms.forEach((list, i) => list.forEach((c) => termOf.set(c.id, i)));

        for (let i = 0; i < plan.terms.length; i++) {
          const sum = plan.terms[i].reduce((s, c) => s + c.credits, 0);
          check(sum >= TERM_FLOOR && sum <= TERM_CAP, `${label}: term ${plan.termNumbers[i]} has ${sum} credits (outside ${TERM_FLOOR}-${TERM_CAP})`);
        }

        for (let i = 0; i < plan.terms.length; i++) {
          for (const c of plan.terms[i]) {
            for (const pid of c.prerequisites) {
              const p = plannerCourses.find((x) => x.id === pid);
              if (p.semester < currentSemester) continue; // already passed
              const pt = termOf.get(pid);
              check(pt !== undefined && pt <= i, `${label}: ${c.code} in term ${plan.termNumbers[i]} precedes prereq ${p.code} (term ${pt})`);
            }
          }
        }

        console.log(`${label}: loads ${plan.terms.map((l) => l.reduce((s, c) => s + c.credits, 0)).join('/')} = ${placedCredits}`);
      }
    }
  }

  // The three plans the "Tạo lại" button cycles through must differ.
  const plans = [
    run(5, 4, 8.5, undefined),
    run(5, 4, 9, 'cân bằng khối lượng mỗi kỳ'),
    run(5, 3, 8.5, 'ưu tiên môn AI'),
  ];
  const signatures = plans.map((p) => p.terms.map((l) => l.map((c) => c.course_code).join(',')).join('|'));
  console.log('\nplan signatures:');
  signatures.forEach((s, i) => console.log(`  ${i}: ${s}`));
  check(new Set(signatures).size === 3, 'the three regenerate plans are not all different');
  check(signatures[0] !== signatures[1], 'faithful and balanced plans are identical');
  check(signatures[0] !== signatures[2], 'faithful and ai-first plans are identical');

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECKS FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
