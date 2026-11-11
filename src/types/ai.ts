/**
 * AI Assistant domain types — mirrors `StudentAiDtos`.
 *
 * Two surfaces share one service layer:
 *   • `ai-chat.tsx`    — a conversational thread with cited sources
 *   • `ai-roadmap.tsx` — a generated semester-by-semester study plan
 */

/* ------------------------------------------------------------ */
/* Chat                                                            */
/* ------------------------------------------------------------ */

export type AiMessageSender = "USER" | "ASSISTANT";

/** `StudentAiDtos.AiChatSourceDto` */
export interface AiChatSource {
  chunkId: string;
  documentTitle: string;
  sectionTitle: string | null;
  quotedText: string | null;
  relevanceScore: number | null;
  rankPosition: number | null;
}

/** `StudentAiDtos.AiChatMessageDto` */
export interface AiChatMessage {
  id: string;
  conversationId: string;
  sender: AiMessageSender;
  content: string;
  questionCategory: string | null;
  isUnsupported: boolean;
  isFallback: boolean;
  confidenceScore: number | null;
  sources: AiChatSource[];
  /** `true` = helpful, `false` = not helpful, `null` = not rated yet. */
  wasHelpful: boolean | null;
  feedback: string | null;
  createdAt: string;
}

/** `StudentAiDtos.SendAiMessageResultDto` */
export interface AiSendMessageResult {
  userMessage: AiChatMessage;
  assistantMessage: AiChatMessage;
}

/** `StudentAiDtos.AiConversationDto` */
export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  status: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

/** A ready-made prompt the student can tap instead of typing. */
export interface AiPromptSuggestion {
  id: string;
  label: string;
  prompt: string;
}

/* ------------------------------------------------------------ */
/* Roadmap                                                         */
/* ------------------------------------------------------------ */

/** The backend uses `IN_PROGRESS` / `PLANNED` for the roadmap terms. */
export type AiSemesterStatus = "IN_PROGRESS" | "PLANNED" | string;

/** `StudentAiDtos.RoadmapCourseDto` */
export interface AiRoadmapCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  categoryName: string | null;
  isMandatory: boolean;
  priority: string | null;
  status: string | null;
  reason: string | null;
  prerequisites: string[];
}

/** `StudentAiDtos.RoadmapSemesterDto` */
export interface AiRoadmapSemester {
  semesterNumber: number;
  semesterCode: string;
  title: string;
  totalCredits: number;
  status: AiSemesterStatus | string;
  courses: AiRoadmapCourse[];
  note: string | null;
}

/** `StudentAiDtos.StudyRoadmapDto` */
export interface AiRoadmap {
  id: string;
  studentId: string;
  title: string;
  summary: string | null;
  generatedAt: string;
  modelName: string | null;
  confidenceScore: number | null;
  totalSemesters: number;
  totalCredits: number;
  semesters: AiRoadmapSemester[];
}

/** `StudentAiDtos.GenerateRoadmapDto` */
export interface AiRoadmapRequest {
  goal?: string;
  maxCreditsPerSemester?: number;
}
