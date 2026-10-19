/**
 * Advisor service — advisor directory + per-student conversations.
 */
import type { Advisor } from "@/types";
import type { Conversation, Message } from "@/lib/db/mockDb";
import type { User } from "@/types";
import { config } from "@/config/api";
import { request } from "@/lib/http";
import { mockAdvisors, mockConversations, mockMessages, mockUsers } from "@/lib/db/mockDb";

const NETWORK_DELAY_MS = 500;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AdvisorCard {
  advisor: Advisor;
  user: Pick<User, "id" | "full_name" | "email" | "phone" | "avatar_url">;
  /** How many students this advisor currently supervises (mocked) */
  advisee_count: number;
}

export async function getAdvisors(): Promise<AdvisorCard[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockAdvisors.map((a) => {
      const u = mockUsers.find((x) => x.id === a.user_id)!;
      return {
        advisor: a,
        user: { id: u.id, full_name: u.full_name, email: u.email, phone: u.phone ?? null, avatar_url: u.avatar_url ?? null },
        advisee_count: 12,
      };
    });
  }
  // return request<AdvisorCard[]>("/advisors");
  throw new Error("Not configured");
}

export async function getConversations(studentId: string): Promise<Conversation[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockConversations
      .filter((c) => c.student_id === studentId)
      .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  }
  // return request<Conversation[]>(`/students/${studentId}/conversations`);
  throw new Error("Not configured");
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return mockMessages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => a.sent_at.localeCompare(b.sent_at));
  }
  // return request<Message[]>(`/conversations/${conversationId}/messages`);
  throw new Error("Not configured");
}

export async function sendMessage(conversationId: string, content: string): Promise<Message> {
  if (config.isMockMode) {
    await wait(NETWORK_DELAY_MS);
    return {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      role: "student",
      content,
      sent_at: new Date().toISOString(),
      read_at: null,
    };
  }
  // return request<Message>(`/conversations/${conversationId}/messages`, { method: "POST", body: { content } });
  throw new Error("Not configured");
}

export async function markConversationRead(conversationId: string): Promise<void> {
  if (config.isMockMode) {
    await wait(200);
    return;
  }
  // await request<void>(`/conversations/${conversationId}/read`, { method: "POST" });
}