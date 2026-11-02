/**
 * The roadmap planner.
 *
 * ── WHY A SEPARATE MODULE ───────────────────────────────────────────────────
 * Scheduling the remaining curriculum is the one piece of the AI assistant
 * that has to be *correct* rather than merely plausible: every pending
 * credit has to be placed exactly once, every term has to sit inside the
 * 14–22 credit band from the training regulation, and no course may precede
 * one of its prerequisites. Keeping that logic here — pure, dependency-free
 * and typed in terms of plain data — means it can be audited on its own
 * (see `scripts/roadmap-audit.mjs`) instead of only through the screen.
 *
 * ── THE ALGORITHM ───────────────────────────────────────────────────────────
 * 1. A baseline: place every course in the term the curriculum puts it in,
 *    breaking ties toward the lightest legal term. Nothing is ever dropped.
 * 2. A repair pass: push a course out of an overfull term, pull one into an
 *    underfull term. Both moves respect the prerequisite order.
 * 3. A policy pass: whichever objective the student asked for, move courses
 *    while a move is legal and makes the plan better.
 */

/** The credit band a term has to sit in, per the K19 training regulation. */
export const TERM_FLOOR = 14;
export const TERM_CAP = 22;

/** The courses that belong to the AI specialisation track. */
const AI_COURSE_CODES = new Set([
  "MLD401",
  "DLP401",
  "MLO302",
  "NLP501",
  "CV501",
  "KBA601",
  "BIS602",
]);

/** A course, reduced to what the planner needs to know about it. */
export interface PlannerCourse {
  id: string;
  course_code: string;
  course_name?: string;
  credits: number;
  type: string;
  semester: number;
  prerequisites: string[];
}

/**
 * The three ways the assistant may schedule the remaining courses.
 *
 *   faithful — keep the curriculum's own ordering. The default plan.
 *   balanced — spread the load as evenly as the credit band allows.
 *   ai-first — pull the specialisation courses as early as their
 *              prerequisites allow, so the AI track lands before the
 *              capstone term.
 */
export type RoadmapPolicy = "faithful" | "balanced" | "ai-first";

export interface PlanInput {
  /** Every course in the curriculum, in curriculum order. */
  courses: PlannerCourse[];
  /** The term the student is currently in (1-based). */
  currentSemester: number;
  /** How many terms the plan may span. */
  preferredTerms: number;
  /** How many terms are left in the curriculum at all. */
  termsAvailable: number;
  /** The objective the assistant optimises for. */
  policy: RoadmapPolicy;
}

export interface PlanResult {
  /** Term index (0-based within the plan) → the courses scheduled there. */
  terms: PlannerCourse[][];
  /** Term index (0-based within the plan) → the curriculum term number. */
  termNumbers: number[];
  /** How many terms the plan spans. */
  termsUsed: number;
  /** True when the student asked for fewer terms than the credit cap allows. */
  compressed: boolean;
  /** The objective the plan was built for. */
  policy: RoadmapPolicy;
}

/**
 * Choose the policy for a request. The student's own words win; a high GPA
 * target means "protect the average", which is the balanced schedule.
 */
export function pickPolicy(
  targetGpa: number,
  note?: string,
): RoadmapPolicy {
  const n = (note ?? "").toLowerCase();
  if (n.includes("ai")) return "ai-first";
  if (n.includes("cân bằng") || n.includes("can bang")) return "balanced";
  if (targetGpa >= 9) return "balanced";
  return "faithful";
}

/** Schedule the remaining courses across the terms of the plan. */
export function planSemesters(input: PlanInput): PlanResult {
  const { courses, currentSemester, termsAvailable, policy } = input;

  const pending = courses
    .filter((c) => c.semester >= currentSemester)
    .sort((a, b) => a.semester - b.semester || a.course_code.localeCompare(b.course_code));

  const remainingCredits = pending.reduce((s, c) => s + c.credits, 0);

  // The handbook caps a term at 22 credits, so a plan can never be shorter
  // than ceil(remaining / 22) terms. A request for fewer is a request the
  // assistant cannot grant — it keeps the shortest legal schedule.
  const minTerms = Math.max(1, Math.ceil(remainingCredits / TERM_CAP));
  const termsUsed = Math.max(
    1,
    Math.min(Math.max(input.preferredTerms, minTerms), termsAvailable),
  );
  const compressed = input.preferredTerms < minTerms;

  const termNumbers: number[] = [];
  for (let i = 0; i < termsUsed; i++) termNumbers.push(currentSemester + i);

  const terms: PlannerCourse[][] = termNumbers.map(() => []);

  // ── Helpers over the assignment ───────────────────────────────────────────

  const byId = new Map(courses.map((c) => [c.id, c]));
  const termOf = new Map<string, number>();
  const load = termNumbers.map(() => 0);

  /** The courses that depend on `course` — they may not move before it. */
  const dependentsOf = (course: PlannerCourse): PlannerCourse[] =>
    pending.filter((c) => c.prerequisites.includes(course.id));

  /**
   * A course may move to `to` only if every prerequisite stays at or before
   * it and every dependent stays at or after it. This is the invariant that
   * keeps the chain intact.
   */
  const canMove = (course: PlannerCourse, to: number): boolean => {
    for (const pid of course.prerequisites) {
      const pt = termOf.get(pid);
      if (pt !== undefined && pt > to) return false;
    }
    for (const dep of dependentsOf(course)) {
      const dt = termOf.get(dep.id);
      if (dt !== undefined && dt < to) return false;
    }
    return true;
  };

  const move = (course: PlannerCourse, from: number, to: number) => {
    const list = terms[from];
    const idx = list.indexOf(course);
    if (idx >= 0) list.splice(idx, 1);
    terms[to].push(course);
    load[from] -= course.credits;
    load[to] += course.credits;
    termOf.set(course.id, to);
  };

  // ── 1. The baseline ───────────────────────────────────────────────────────

  // Courses are placed in dependency order, so a prerequisite is always
  // scheduled before the course that depends on it.
  const depthOf = (course: PlannerCourse): number => {
    let depth = 0;
    let cur = course;
    const seen = new Set<string>();
    while (cur.prerequisites.length > 0 && !seen.has(cur.id)) {
      seen.add(cur.id);
      const p = byId.get(cur.prerequisites[0]);
      if (!p) break;
      depth += 1;
      cur = p;
    }
    return depth;
  };

  const order = [...pending].sort(
    (a, b) =>
      depthOf(a) - depthOf(b) ||
      a.semester - b.semester ||
      a.course_code.localeCompare(b.course_code),
  );

  // The term the curriculum would put each course in.
  const homeOf = new Map<string, number>();
  for (const course of pending) {
    const offset = course.semester - currentSemester;
    homeOf.set(
      course.id,
      Math.min(
        termsUsed - 1,
        Math.max(0, Math.floor((offset * termsUsed) / termsAvailable)),
      ),
    );
  }

  for (const course of order) {
    const prereqTerms = course.prerequisites
      .map((pid) => termOf.get(pid))
      .filter((t): t is number => typeof t === "number");
    const earliest = prereqTerms.length > 0 ? Math.max(...prereqTerms) : 0;

    const legal = termNumbers
      .map((_, i) => i)
      .filter((i) => i >= earliest);
    const withRoom = legal.filter((i) => load[i] + course.credits <= TERM_CAP);

    const home = homeOf.get(course.id) ?? 0;
    const pool = withRoom.length > 0 ? withRoom : legal;

    // Prefer the curriculum's own term; otherwise take the lightest legal
    // term. If nothing has room the course still gets placed — the repair
    // pass below sorts the overflow out.
    const chosen =
      pool.find((i) => i === home) ??
      pool.reduce((best, i) => (load[i] < load[best] ? i : best), pool[0]);

    terms[chosen].push(course);
    load[chosen] += course.credits;
    termOf.set(course.id, chosen);
  }

  // ── 2. The repair pass ────────────────────────────────────────────────────
  //
  // Push a course out of an overfull term, then pull one into an underfull
  // term. Both moves keep the prerequisite order intact.

  const repair = () => {
    // Overfull terms first.
    for (let guard = 0; guard < 500; guard++) {
      const from = load.findIndex((l) => l > TERM_CAP);
      if (from < 0) break;

      // The lightest course that may legally leave.
      const candidates = [...terms[from]]
        .filter((c) => {
          for (const pid of c.prerequisites) {
            const pt = termOf.get(pid);
            if (pt !== undefined && pt > from) return false;
          }
          return true;
        })
        .sort((a, b) => a.credits - b.credits);

      let moved = false;
      for (const course of candidates) {
        const to = load
          .map((l, i) => ({ l, i }))
          .filter(({ i }) => i !== from && load[i] + course.credits <= TERM_CAP)
          .sort((a, b) => a.l - b.l)[0];
        if (!to) continue;
        if (!canMove(course, to.i)) continue;
        move(course, from, to.i);
        moved = true;
        break;
      }
      if (!moved) break;
    }

    // Underfull terms next.
    for (let guard = 0; guard < 500; guard++) {
      const to = load.findIndex((l) => l < TERM_FLOOR);
      if (to < 0) break;

      const candidates: { course: PlannerCourse; from: number }[] = [];
      for (let from = 0; from < terms.length; from++) {
        if (from === to) continue;
        for (const course of terms[from]) {
          if (load[from] - course.credits < TERM_FLOOR) continue;
          if (!canMove(course, to)) continue;
          candidates.push({ course, from });
        }
      }
      candidates.sort((a, b) => b.course.credits - a.course.credits);

      const pick = candidates[0];
      if (!pick) break;
      move(pick.course, pick.from, to);
    }
  };

  repair();

  // ── 3. The policy pass ────────────────────────────────────────────────────

  if (policy === "balanced") {
    // Move the course that best evens the two ends out, over and over.
    for (let guard = 0; guard < 500; guard++) {
      const heaviest = load.reduce((b, l, i) => (l > load[b] ? i : b), 0);
      const lightest = load.reduce((b, l, i) => (l < load[b] ? i : b), 0);
      if (heaviest === lightest) break;
      if (load[heaviest] - load[lightest] <= 1) break;

      let best: { course: PlannerCourse; to: number; score: number } | null =
        null;

      for (const course of terms[heaviest]) {
        for (let to = 0; to < terms.length; to++) {
          if (to === heaviest) continue;
          if (load[to] + course.credits > TERM_CAP) continue;
          if (load[heaviest] - course.credits < TERM_FLOOR) continue;
          if (!canMove(course, to)) continue;

          const after = load.map((l, i) =>
            i === heaviest ? l - course.credits : i === to ? l + course.credits : l,
          );
          // How far the plan still is from an even spread.
          const score = after.reduce((s, l) => s + (l - remainingCredits / terms.length) ** 2, 0);
          if (!best || score < best.score) best = { course, to, score };
        }
      }

      if (!best) break;
      move(best.course, heaviest, best.to);
    }
  }

  if (policy === "ai-first") {
    // Pull the specialisation courses as early as the chain allows.
    const aiCourses = pending
      .filter((c) => AI_COURSE_CODES.has(c.course_code))
      .sort((a, b) => termOf.get(b.id)! - termOf.get(a.id)!);

    for (const course of aiCourses) {
      for (let to = 0; to < terms.length; to++) {
        const from = termOf.get(course.id)!;
        if (to >= from) break;
        if (load[to] + course.credits > TERM_CAP) continue;
        if (load[from] - course.credits < TERM_FLOOR) continue;
        if (!canMove(course, to)) continue;
        move(course, from, to);
        break;
      }
    }
  }

  // Every term reads top-to-bottom the way the handbook lists it.
  for (const list of terms) {
    list.sort(
      (a, b) =>
        a.semester - b.semester || a.course_code.localeCompare(b.course_code),
    );
  }

  return { terms, termNumbers, termsUsed, compressed, policy };
}
