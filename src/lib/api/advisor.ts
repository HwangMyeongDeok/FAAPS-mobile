/**
 * Advisor service — advisor directory + per-student conversations & messages.
 *
 * ── MOCK-FIRST STRATEGY ──────────────────────────────────────────────────────
 * The `else` branch already contains the real HTTP calls. Flip
 * `config.isMockMode` to false (app.json → extra, or EXPO_PUBLIC_MOCK_MODE)
 * to switch over.
 */
import type { Advisor, User } from "@/types";
import type { Conversation, Message } from "@/lib/db/mockDb";
import { config } from "@/config/api";
import { http } from "@/lib/http";
import { getAuthToken } from "@/lib/api/token";
import { mockDelay } from "@/lib/db/mockDelay";
import { mockAdvisors, mockConversations, mockMessages, mockUsers } from "@/lib/db/mockDb";

export interface AdvisorCard {
  advisor: Advisor;
  user: Pick<User, "id" | "full_name" | "email" | "phone" | "avatar_url">;
  /** How many students this advisor currently supervises */
  advisee_count: number;
}

export async function getAdvisors(): Promise<AdvisorCard[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockAdvisors.map((a) => {
      const u = mockUsers.find((x) => x.id === a.user_id)!;
      const adviseeCount = mockConversations.filter(
        (c) => c.advisor_id === a.user_id,
      ).length;
      return {
        advisor: a,
        user: {
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone ?? null,
          avatar_url: u.avatar_url ?? null,
        },
        advisee_count: adviseeCount,
      };
    });
  }

  // TODO: Wire BE later — the endpoint paths below are the agreed contract.
  const token = await getAuthToken();
  return http.get<AdvisorCard[]>("/api/advisors", { token });
}

export async function getConversations(studentId: string): Promise<Conversation[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockConversations
      .filter((c) => c.student_id === studentId)
      .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<Conversation[]>(`/api/students/${studentId}/conversations`, { token });
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (config.isMockMode) {
    await mockDelay();
    return mockMessages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => a.sent_at.localeCompare(b.sent_at));
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.get<Message[]>(`/api/conversations/${conversationId}/messages`, { token });
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  if (config.isMockMode) {
    await mockDelay();
    const message: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      role: "student",
      content,
      sent_at: new Date().toISOString(),
      read_at: null,
    };
    // Persist into the in-memory mock DB so the thread stays consistent.
    mockMessages.push(message);
    const conv = mockConversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.last_message_at = message.sent_at;
      conv.unread_count = 0;
    }
    return message;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  return http.post<Message>(`/api/conversations/${conversationId}/messages`, { content }, { token });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  if (config.isMockMode) {
    await mockDelay(200);
    const conv = mockConversations.find((c) => c.id === conversationId);
    if (conv) conv.unread_count = 0;
    const now = new Date().toISOString();
    mockMessages
      .filter((m) => m.conversation_id === conversationId && m.read_at === null)
      .forEach((m) => {
        m.read_at = now;
      });
    return;
  }

  // TODO: Wire BE later
  const token = await getAuthToken();
  await http.post<void>(`/api/conversations/${conversationId}/read`, undefined, { token });
}
