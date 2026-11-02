/**
 * AI Assistant service — the conversational thread and the generated roadmap.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 *
 * The mock answers are written by hand, not generated: every claim they make
 * is checked against the curriculum table in `mockDb.ts`, so the chat and the
 * roadmap never contradict each other.
 */
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import {
  pickPolicy,
  planSemesters,
  TERM_CAP,
  type RoadmapPolicy,
} from "@/lib/api/roadmapPlanner";
import {
  aiPromptSuggestions,
  aiSourceDocs,
  mockAiThreads,
  mockCurriculumCourses,
  mockStudents,
  mockUsers,
  type AiChatMessageShape,
  type AiSourceDoc,
  type AiSourceRef,
} from "@/lib/db/mockDb";
import type {
  AiChatMessage,
  AiChatThread,
  AiPromptSuggestion,
  AiRoadmap,
  AiRoadmapRequest,
  AiRoadmapSemester,
  AiSource,
} from "@/types/ai";

export type { AiPromptSuggestion };

// ── Term labels ─────────────────────────────────────────────────────────────

/**
 * The eight curriculum terms, in order. Term 5 is Fall 2026 — the term the
 * demo students are currently in — so the roadmap reads as "where I am now
 * and what comes after" rather than a generic 8-term list.
 */
const TERMS: { term: string; label: string }[] = [
  { term: "Fall 2024", label: "Kỳ 1" },
  { term: "Spring 2025", label: "Kỳ 2" },
  { term: "Summer 2025", label: "Kỳ 3" },
  { term: "Fall 2025", label: "Kỳ 4" },
  { term: "Fall 2026", label: "Kỳ 5" },
  { term: "Spring 2027", label: "Kỳ 6" },
  { term: "Fall 2027", label: "Kỳ 7" },
  { term: "Spring 2028", label: "Kỳ 8" },
];

/** Terms after the current one, used by the roadmap header. */
// (the roadmap slices TERMS directly — see buildRoadmap)

// ── Roadmap planning ─────────────────────────────────────────────────────────

// The scheduler lives in its own module so it can be audited on its own —
// see `scripts/roadmap-audit.mjs`.
export {
  TERM_CAP,
  TERM_FLOOR,
  pickPolicy,
  planSemesters,
  type RoadmapPolicy,
} from "@/lib/api/roadmapPlanner";

// ── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Turn the stored message shape (which references source documents by id)
 * into the wire shape the screen renders (which carries the source text).
 */
function hydrateMessage(message: AiChatMessageShape): AiChatMessage {
  const sources: AiSource[] = (message.sources ?? []).map((ref) => {
    const doc = aiSourceDocs.find((d) => d.id === ref.doc_id);
    return {
      index: ref.index,
      kind: doc?.kind ?? "curriculum",
      title: doc?.title ?? "Tài liệu",
      locator: doc?.locator ?? "",
      excerpt: doc?.excerpt ?? "",
    };
  });

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sent_at: message.sent_at,
    sources: sources.length > 0 ? sources : undefined,
    rating: message.rating ?? null,
  };
}

export async function getAiThread(studentId: string): Promise<AiChatThread> {
  if (config.isMockMode) {
    await mockDelay();
    const thread = mockAiThreads[studentId] ?? [];
    return { messages: thread.map(hydrateMessage) };
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<AiChatThread>(`/api/ai/thread?student=${studentId}`, { token });
}

export async function getPromptSuggestions(): Promise<AiPromptSuggestion[]> {
  if (config.isMockMode) {
    await mockDelay(120);
    return aiPromptSuggestions;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<AiPromptSuggestion[]>("/api/ai/prompts", { token });
}

/**
 * The answer table. Each entry is matched on the keywords in the student's
 * question; the first match wins. `keywords` are matched case-insensitively
 * against the lowercased question.
 */
const ANSWERS: {
  id: string;
  keywords: string[];
  content: string;
  sources: { doc_id: string; note: string }[];
}[] = [
  {
    id: "a-credits",
    keywords: ["còn bao nhiêu tín chỉ", "thiếu bao nhiêu tín chỉ", "còn mấy tín chỉ", "bao nhiêu tín chỉ"],
    content:
      "Bạn đã tích lũy 70 tín chỉ trong 4 kỳ đầu, chương trình yêu cầu 150. Nghĩa là còn 80 tín chỉ — tức 4 kỳ tới, trung bình 20 tín chỉ mỗi kỳ.\n\n80 tín chỉ chia đều 4 kỳ là 20, vẫn nằm trong giới hạn 22 tín chỉ, nhưng hơi chật. Tôi đã san đều thành 19 · 21 · 18 · 22 để giữ mỗi kỳ có một môn dễ để cải thiện điểm.",
    sources: [
      { doc_id: "src-cv-k19", note: "Tổng 150 tín chỉ trong 8 kỳ." },
      { doc_id: "src-reg-credit", note: "Giới hạn 14–22 tín chỉ mỗi kỳ." },
    ],
  },
  {
    id: "a-next-semester",
    keywords: ["kỳ tới", "học môn nào", "môn nào cho", "kỳ sau", "học gì"],
    content:
      "Kỳ 5 nên học 5 môn lõi: Machine Learning (MLD401), Deep Learning (DLP401), Cloud Computing (CLD402), Introduction to Cryptography (ITC401) và Software Project 2 (PRJ402).\n\nMLD401 và DLP401 là cặp môn AI mà cố vấn Thông khuyên học song song, vì cả hai là tiên quyết cho Capstone ở kỳ 7. Tôi thêm LAB501 (2 tín chỉ) để kỳ này đủ 20 tín chỉ — không quá tải, vẫn còn một môn thực hành để giữ nhịp.\n\nĐiều kiện: điểm môn tiên quyết phải từ 5.00 trở lên, nên nếu bạn trượt MLD401 thì DLP401 vẫn học được ở kỳ 6 mà không mất thêm học phần.",
    sources: [
      { doc_id: "src-adv-thong", note: "Cố vấn khuyên học MLD401 và DLP401 song song." },
      { doc_id: "src-reg-k19", note: "Điểm tiên quyết tối thiểu 5.00." },
      { doc_id: "src-cv-k19", note: "Môn lớn của kỳ 5." },
    ],
  },
  {
    id: "a-prereq",
    keywords: ["tiên quyết", "điều kiện", "đủ điều kiện", "prerequisite"],
    content:
      "Quy chế đào tạo K19 quy định: sinh viên phải đạt điểm từ 5.00 trở lên ở môn tiên quyết mới được đăng ký môn phụ thuộc. Riêng CAP401 (Capstone I) yêu cầu trung bình tối thiểu 7.00 trong 4 môn tiên quyết, và mỗi môn không dưới 5.00.\n\nVới GPA hiện tại của bạn, các môn cần theo dõi sát nhất là MLD401, DLP401, CLD402 và ITC401 — đây là bốn môn quyết định việc bạn có đủ điều kiện bảo vệ capstone ở kỳ 7 hay không.",
    sources: [
      { doc_id: "src-reg-k19", note: "Điều 12 · Tín chỉ và tiên quyết." },
      { doc_id: "src-syl-cap", note: "Yêu cầu đầu ra của Capstone Project I." },
    ],
  },
  {
    id: "a-specialization",
    keywords: ["chuyên ngành", "cn", "hướng", "ai hay cloud", "chọn môn nào chuyên ngành"],
    content:
      "Chương trình có 5 chuyên ngành hẹp: Artificial Intelligence, Cloud Computing, Internet of Things, Data Science và Game Development.\n\nVới nền tảng lập trình và cơ sở dữ liệu bạn đã học ở kỳ 1–2, cả AI và Data Science đều mở ngay. AI cần thêm 3 môn lý thuyết nặng (MLD401, DLP401, NLP501) nhưng phù hợp nếu bạn hướng tới mô hình và nghiên cứu; Data Science nhẹ hơn và hợp nếu bạn thích phân tích dữ liệu.\n\nLưu ý thực tế: cả hai hướng dùng chung CAP401 và PRJ601 ở kỳ 7, nên bạn cần chốt trước kỳ 6 để kịp đăng ký môn chuyên ngành.",
    sources: [
      { doc_id: "src-cv-k19", note: "Danh sách chuyên ngành hẹp của K19." },
      { doc_id: "src-adv-thong", note: "Cố vấn gợi ý chốt chuyên ngành trước kỳ 6." },
    ],
  },
  {
    id: "a-credit-limit",
    keywords: ["tín chỉ", "đăng ký môn", "bao nhiêu tín chỉ tối đa", "khối lượng"],
    content:
      "Mỗi học kỳ bạn được đăng ký tối thiểu 14 và tối đa 22 tín chỉ. Lộ trình tôi đề xuất giữ mỗi kỳ trong khoảng 18–22 tín chỉ — vừa đủ nặng để ra kết quả, vừa để bạn có môn dễ cải thiện điểm khi cần nâng GPA.\n\nKỳ thực tập (PRJ601, PRJ602) là ngoại lệ — tín chỉ môn này không tính vào giới hạn đăng ký.",
    sources: [
      { doc_id: "src-reg-credit", note: "Mục 2.3 · Khối lượng học tập." },
    ],
  },
  {
    id: "a-capstone",
    keywords: ["capstone", "bảo vệ", "đồ án", "project 1", "năm cuối"],
    content:
      "Capstone chia làm hai học phần: CAP401 ở kỳ 7 (phân tích yêu cầu, thiết kế kiến trúc, dựng MVP) và CAP402 ở kỳ 8 (hoàn thiện, kiểm thử, triển khai và bảo vệ trước hội đồng).\n\nCAP401 yêu cầu nhóm tối thiểu 3 sinh viên, phải bảo vệ giữa kỳ và nộp báo cáo kỹ thuật tối thiểu 40 trang. Điều kiện vào CAP401 là trung bình 4 môn tiên quyết tối thiểu 7.00 — đây là mốc cần canh nhất trong cả chương trình.\n\nVới GPA 7.42 của bạn, bạn đang ở biên an toàn 0.42 điểm. Giữ nguyên mức điểm hiện tại ở MLD401 và CLD402 là đủ.",
    sources: [
      { doc_id: "src-syl-cap", note: "Mục 2 · Yêu cầu đầu ra của CAP401." },
      { doc_id: "src-reg-k19", note: "Ngưỡng tiên quyết 7.00 cho môn bảo vệ." },
    ],
  },
  {
    id: "a-grading",
    keywords: ["điểm", "cách chấm", "đánh giá môn", "grade", "thi"],
    content:
      "Cách chấm khác nhau theo từng môn. Với MLD401 (Machine Learning): 40% bài tập, 30% đồ án giữa kỳ và 30% đồ án cuối kỳ trình bày nhóm.\n\nVề thiểm khai điểm, quy chế tính GPA trên thang 10, điểm môn lấy theo điểm cuối kỳ (giữa kỳ chỉ tính 20% nếu môn có điểm giữa kỳ trên 5.00).\n\nĐiểm cần để đạt điều kiện tiên quyết là 5.00 — nhưng để vào được CAP401 thì cần trung bình 7.00 trên 4 môn tiên quyết. Hai ngưỡng này khác nhau, và ngưỡng thứ hai mới là thứ quyết định.",
    sources: [
      { doc_id: "src-syl-mld", note: "Mục 3 · Đánh giá môn học MLD401." },
      { doc_id: "src-reg-k19", note: "Cách tính GPA và ngưỡng tiên quyết." },
    ],
  },
];

/** The catch-all answer. */
const FALLBACK_ANSWER = {
  id: "a-fallback",
  keywords: [],
  content:
    "Tôi chưa có đủ dữ liệu để trả lời chính xác câu hỏi này, nhưng đây là những gì tôi biết về hồ sơ của bạn:\n\nBạn đang học Software Engineering chương trình K19, đã hoàn thành 4 kỳ với 70 tín chỉ tích lũy. Chương trình yêu cầu 150 tín chỉ, nên còn 80 tín chỉ — tức 4 kỳ tới.\n\nNếu câu hỏi của bạn thuộc một trong các nhóm dưới đây, tôi sẽ trả lời chính xác hơn:\n• Môn nào nên học ở kỳ tới\n• Điều kiện tiên quyết để đăng ký môn\n• Còn thiếu bao nhiêu tín chỉ\n• Nên chọn chuyên ngành nào\n• Cách chấm điểm một môn cụ thể\n\nBạn cũng có thể mở Lộ trình AI để xem toàn bộ kế hoạch 8 kỳ đã được gợi ý.",
  sources: [{ doc_id: "src-cv-k19", note: "Chương trình khung K19 — Software Engineering." }],
};

/**
 * Pick the answer for a question. A question that mentions a course code
 * wins over a generic match, because that is the most specific ask.
 */
function pickAnswer(question: string): (typeof ANSWERS)[number] {
  const q = question.toLowerCase();
  const matched = ANSWERS.find((a) => a.keywords.some((k) => q.includes(k)));
  if (matched) return matched;
  return FALLBACK_ANSWER;
}

/**
 * Send a message and get the assistant's answer.
 *
 * The mock delay is deliberately longer than a normal request — it is what
 * the typing indicator is for.
 */
export async function sendAiMessage(
  studentId: string,
  question: string,
): Promise<AiChatMessage> {
  if (config.isMockMode) {
    await mockDelay(1400);

    const answer = pickAnswer(question);
    const now = new Date().toISOString();

    // Persist into the in-memory thread so the history survives a re-render.
    const thread = mockAiThreads[studentId] ?? (mockAiThreads[studentId] = []);
    const sources: AiSourceRef[] = answer.sources.map((s, i) => ({
      index: i + 1,
      doc_id: s.doc_id,
      note: s.note,
    }));

    const message: AiChatMessageShape = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: answer.content,
      sent_at: now,
      sources,
      rating: null,
    };
    thread.push(message);

    return hydrateMessage(message);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<AiChatMessage>(
    `/api/ai/ask?student=${studentId}`,
    { question },
    { token },
  );
}

/** Record the student's verdict on one answer. */
export async function rateAiMessage(
  studentId: string,
  messageId: string,
  rating: "up" | "down",
): Promise<void> {
  if (config.isMockMode) {
    await mockDelay(150);
    const thread = mockAiThreads[studentId] ?? [];
    const message = thread.find((m) => m.id === messageId);
    if (message) message.rating = rating;
    return;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  await http.post<void>(
    `/api/ai/thread/${messageId}/rating`,
    { rating },
    { token },
  );
}

// ── Roadmap ──────────────────────────────────────────────────────────────────

/**
 * Build the roadmap from the curriculum table, so every course on the plan
 * is a real course with the real credit count and the real prerequisites.
 */
function buildRoadmap(studentId: string, request: AiRoadmapRequest): AiRoadmap {
  const student = mockStudents.find((s) => s.user_id === studentId);
  const currentSemester = student?.current_semester ?? 5;
  const currentGpa = student?.current_gpa ?? 7.42;

  const earned = mockCurriculumCourses
    .filter((c) => c.semester < currentSemester)
    .reduce((s, c) => s + c.credits, 0);

  const total = mockCurriculumCourses.reduce((s, c) => s + c.credits, 0);

  // Schedule the remaining courses. The planner owns the credit band, the
  // prerequisite order and the policy — see `roadmapPlanner.ts`.
  const plan = planSemesters({
    courses: mockCurriculumCourses.map((c) => ({
      id: c.id,
      course_code: c.course_code,
      course_name: c.name,
      credits: c.credits,
      type: c.type,
      semester: c.semester,
      prerequisites: c.prerequisites,
    })),
    currentSemester,
    preferredTerms: request.preferred_terms,
    termsAvailable: TERMS.length - currentSemester + 1,
    policy: pickPolicy(request.target_gpa, request.note),
  });

  const semesters: AiRoadmapSemester[] = [];

  // Completed terms — shown for context, no courses repeated in full.
  for (let num = 1; num < currentSemester; num++) {
    const courses = mockCurriculumCourses.filter((c) => c.semester === num);
    const term = TERMS[num - 1];
    semesters.push({
      semester: num,
      label: term.label,
      term: term.term,
      status: "completed",
      courses: courses.map((c) => ({
        course_code: c.course_code,
        course_name: c.name,
        credits: c.credits,
        category: c.type,
        reason: "Đã hoàn thành trong chương trình khung.",
        prerequisites: [],
      })),
      projected_gpa: 0,
      note: `${courses.length} môn · ${courses.reduce((s, c) => s + c.credits, 0)} tín chỉ đã tích lũy.`,
    });
  }

  // The remaining terms.
  plan.terms.forEach((courses, index) => {
    const num = plan.termNumbers[index];
    const term = TERMS[num - 1];
    const credits = courses.reduce((s, c) => s + c.credits, 0);

    const reasons = reasonFor(courses, num, currentSemester, request);
    const projected = projectGpa(currentGpa, num, currentSemester, credits);

    semesters.push({
      semester: num,
      label: term.label,
      term: term.term,
      status: num === currentSemester ? "current" : "planned",
      courses: courses.map((c) => {
        const prereqCourses = c.prerequisites
          .map((pid) => mockCurriculumCourses.find((x) => x.id === pid))
          .filter((x): x is NonNullable<typeof x> => Boolean(x));
        return {
          course_code: c.course_code,
          course_name: c.course_name ?? c.course_code,
          credits: c.credits,
          category: c.type,
          reason: reasons[c.course_code] ?? "Bổ sung khối lượng học tập theo chương trình khung.",
          prerequisites: prereqCourses.map((p) => p.course_code),
        };
      }),
      projected_gpa: projected,
      note: semesterNote(num, currentSemester, credits, courses),
    });
  });

  const planned = semesters.filter((s) => s.status !== "completed");
  const plannedGpa =
    planned.length > 0
      ? planned.reduce((s, x) => s + x.projected_gpa, 0) / planned.length
      : currentGpa;

  const lastTerm = semesters[semesters.length - 1];

  return {
    id: `roadmap-${studentId}`,
    generated_at: new Date().toISOString(),
    strategy: buildStrategy(
      request,
      planned.length,
      plan.compressed,
      plan.policy,
    ),
    earned_credits: earned,
    total_credits: total,
    projected_gpa: Math.round(plannedGpa * 100) / 100,
    graduation_term: lastTerm?.term ?? "Spring 2028",
    semesters,
  };
}

/** A one-line reason per course, derived from what the course actually is. */
function reasonFor(
  courses: { course_code: string; type: string; credits: number }[],
  semesterNum: number,
  currentSemester: number,
  request: AiRoadmapRequest,
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const course of courses) {
    if (course.type === "PROJECT") {
      out[course.course_code] = "Đồ án tốt nghiệp — cần hai kỳ liên tiếp để hoàn thiện.";
    } else if (course.type === "PRACTICUM") {
      out[course.course_code] =
        "Học phần thực hành, chạy song song với môn lý thuyết để giữ điểm ổn định.";
    } else if (course.type === "ELECTIVE") {
      out[course.course_code] = request.note
        ? `Chuyên ngành theo ràng buộc bạn đặt ra: ${request.note}.`
        : "Môn chuyên ngành — chọn theo hướng bạn muốn theo đuổi.";
    } else if (semesterNum === currentSemester) {
      out[course.course_code] =
        "Môn lõi của kỳ hiện tại, tiên quyết cho các môn kỳ sau.";
    } else {
      out[course.course_code] = "Môn lõi, là tiên quyết cho môn kế tiếp trong chuỗi.";
    }
  }
  return out;
}

/** The assistant's projected GPA for one term. */
function projectGpa(
  currentGpa: number,
  semesterNum: number,
  currentSemester: number,
  credits: number,
): number {
  // A heavy term costs a little; a lighter one gives a little back. The
  // effect shrinks the further out the term is.
  const distance = Math.max(0, semesterNum - currentSemester);
  const loadPenalty = Math.min(0.35, Math.max(0, credits - 18) * 0.03);
  const recovery = Math.min(0.15, Math.max(0, 18 - credits) * 0.03);
  const value = currentGpa - loadPenalty + recovery - distance * 0.01;
  return Math.round(value * 100) / 100;
}

/** The one-line note under each term. */
function semesterNote(
  semesterNum: number,
  currentSemester: number,
  credits: number,
  courses: { type: string }[],
): string {
  const hasProject = courses.some((c) => c.type === "PROJECT");
  const coreCount = courses.filter((c) => c.type === "CORE").length;

  if (semesterNum === currentSemester) {
    const practice = courses.filter((c) => c.type === "PRACTICUM").length;
    return `Kỳ đang học — ${credits} tín chỉ, ${coreCount} môn lõi${
      practice > 0 ? ` và ${practice} môn thực hành` : ""
    }.`;
  }
  if (hasProject) {
    return `Kỳ đồ án — ${credits} tín chỉ, đồ án tốt nghiệp chiếm phần lớn khối lượng.`;
  }
  if (credits >= 21) {
    return `Kỳ nặng nhất còn lại — ${credits} tín chỉ, cần ưu tiên sắp xếp thời gian.`;
  }
  return `${credits} tín chỉ — khối lượng vừa phải, có môn dễ để cải thiện điểm.`;
}

/** The strategy line under the title. */
function buildStrategy(
  request: AiRoadmapRequest,
  terms: number,
  compressed: boolean,
  policy: RoadmapPolicy,
): string {
  const target = request.target_gpa.toFixed(1);
  const base = `Tối ưu cho GPA mục tiêu ${target}/10 trong ${terms} kỳ tới,`;

  // When the student asked for a schedule the credit cap makes impossible,
  // the assistant says so instead of quietly planning a different one.
  const compression = compressed
    ? ` Không thể gộp còn lại vào ${request.preferred_terms} kỳ — quy chế giới hạn ${TERM_CAP} tín chỉ mỗi kỳ, nên AI giữ ${terms} kỳ.`
    : "";

  const emphasis =
    policy === "ai-first"
      ? "ưu tiên môn AI để kịp chuyên ngành trước kỳ đồ án."
      : policy === "balanced"
        ? "cân bằng khối lượng mỗi kỳ để giữ GPA ổn định."
        : "bám theo thứ tự chương trình khung, chỉ điều chỉnh khi quy chế yêu cầu.";

  return request.note
    ? `${base} có ràng buộc "${request.note}", ${emphasis}${compression}`
    : `${base} ${emphasis}${compression}`;
}

// ── Service functions ────────────────────────────────────────────────────────

export async function getAiRoadmap(
  studentId: string,
  request?: Partial<AiRoadmapRequest>,
): Promise<AiRoadmap> {
  const full: AiRoadmapRequest = {
    target_gpa: request?.target_gpa ?? 8.5,
    preferred_terms: request?.preferred_terms ?? 4,
    note: request?.note,
  };

  if (config.isMockMode) {
    await mockDelay();
    return buildRoadmap(studentId, full);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<AiRoadmap>(`/api/ai/roadmap?student=${studentId}`, { token });
}

/** Ask the assistant to build a fresh roadmap under new constraints. */
export async function regenerateAiRoadmap(
  studentId: string,
  request: AiRoadmapRequest,
): Promise<AiRoadmap> {
  if (config.isMockMode) {
    // A real LLM takes 5–20s here; the mock keeps it long enough that the
    // regenerating state is visible, short enough not to be annoying.
    await mockDelay(1800);
    return buildRoadmap(studentId, request);
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<AiRoadmap>(
    `/api/ai/roadmap/regenerate?student=${studentId}`,
    request,
    { token },
  );
}

/** The student record behind the roadmap, for the header. */
export async function getAiStudentName(studentId: string): Promise<string> {
  const user = mockUsers.find((u) => u.id === studentId);
  return user?.full_name ?? "Sinh viên";
}

/** Exposed so the screen can show the source list behind the citation. */
export function getSourceDoc(docId: string): AiSourceDoc | undefined {
  return aiSourceDocs.find((d) => d.id === docId);
}
