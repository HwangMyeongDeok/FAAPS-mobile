/**
 * AI Assistant service — the conversational thread and the generated roadmap.
 */
import { config } from "@/config/api";
import { http } from "@/lib/http";
import type {
  AiChatMessage,
  AiConversation,
  AiPromptSuggestion,
  AiRoadmap,
  AiRoadmapRequest,
  AiSendMessageResult,
} from "@/types/ai";

export type { AiPromptSuggestion } from "@/types/ai";

/** `GET /api/student/ai/conversations` */
export async function getAiConversations(): Promise<AiConversation[]> {
  return http.get<AiConversation[]>("/api/student/ai/conversations");
}

/** `POST /api/student/ai/conversations` */
export async function createAiConversation(
  title?: string,
): Promise<AiConversation> {
  return http.post<AiConversation>(
    "/api/student/ai/conversations",
    title ? { title } : {},
  );
}

/** `GET /api/student/ai/conversations/{id}/messages` */
export async function getAiMessages(
  conversationId: string,
): Promise<AiChatMessage[]> {
  return http.get<AiChatMessage[]>(
    `/api/student/ai/conversations/${conversationId}/messages`,
  );
}

/**
 * `POST /api/student/ai/conversations/{id}/messages`
 *
 * The backend answers with both the stored user message and the assistant's
 * reply, so the screen can render them straight away.
 */
export async function sendAiMessage(
  conversationId: string,
  content: string,
): Promise<AiSendMessageResult> {
  return http.post<AiSendMessageResult>(
    `/api/student/ai/conversations/${conversationId}/messages`,
    { content },
    { timeoutMs: config.aiTimeoutMs },
  );
}

/** `PATCH /api/student/ai/messages/{id}/feedback` */
export async function rateAiMessage(
  messageId: string,
  wasHelpful: boolean,
  feedback?: string,
): Promise<void> {
  await http.patch<{ updated: boolean }>(
    `/api/student/ai/messages/${messageId}/feedback`,
    { wasHelpful, feedback },
  );
}

/** `GET /api/student/ai/roadmap` */
export async function getAiRoadmap(): Promise<AiRoadmap | null> {
  try {
    return await http.get<AiRoadmap>("/api/student/ai/roadmap");
  } catch {
    return null;
  }
}

/** `POST /api/student/ai/roadmap` — regenerates the plan. */
export async function regenerateAiRoadmap(
  request: AiRoadmapRequest = {},
): Promise<AiRoadmap> {
  return http.post<AiRoadmap>(
    "/api/student/ai/roadmap",
    {
      goal: request.goal,
      maxCreditsPerSemester: request.maxCreditsPerSemester,
    },
    { timeoutMs: config.aiTimeoutMs },
  );
}

/**
 * The starter prompts shown on an empty thread. The backend has no prompt
 * endpoint, so they live here — they are plain questions, not mock data.
 */
export const AI_PROMPT_SUGGESTIONS: AiPromptSuggestion[] = [
  {
    id: "prompt-credits",
    label: "How many credits do I still need to graduate?",
    prompt:
      "How many credits do I still need to graduate, and how should I spread them across the remaining semesters?",
  },
  {
    id: "prompt-prereq",
    label: "What are the prerequisites for my next courses?",
    prompt:
      "Which courses should I take next, and what are their prerequisites?",
  },
  {
    id: "prompt-gpa",
    label: "How can I improve my GPA?",
    prompt:
      "My current GPA is not what I want it to be. How can I improve it and which courses should I prioritise?",
  },
  {
    id: "prompt-graduation",
    label: "Am I on track to graduate on time?",
    prompt:
      "Am I on track to graduate on time? Please check my earned credits against the curriculum requirements.",
  },
];
