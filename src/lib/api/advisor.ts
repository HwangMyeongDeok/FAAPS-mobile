/**
 * Advising service — the student's advising requests and their conversations
 * with the advisor.
 */
import { http } from "@/lib/http";
import type {
  AdvisingDetail,
  AdvisingRequest,
  AdvisorAssignmentRequestResult,
  AdvisorAssignmentStatus,
} from "@/types";

/**
 * `GET /api/student/advisor-assignment`
 *
 * Reports whether the student already has an advisor and whether a request
 * to the admins is still waiting. `advisorId` is null while unassigned.
 */
export async function getAdvisorAssignment(): Promise<AdvisorAssignmentStatus> {
  return http.get<AdvisorAssignmentStatus>("/api/student/advisor-assignment");
}

/**
 * `POST /api/student/advisor-assignment-requests`
 *
 * Asks the admins to assign an advisor. The call is idempotent: sending it
 * again while a request is pending returns the same id with
 * `created: false` instead of failing.
 */
export async function requestAdvisorAssignment(): Promise<AdvisorAssignmentRequestResult> {
  return http.post<AdvisorAssignmentRequestResult>(
    "/api/student/advisor-assignment-requests",
  );
}

/** `GET /api/student/advising-requests` */
export async function getAdvisingRequests(): Promise<AdvisingRequest[]> {
  return http.get<AdvisingRequest[]>("/api/student/advising-requests");
}

/** `GET /api/student/advising-requests/{id}` */
export async function getAdvisingRequestDetail(
  requestId: string,
): Promise<AdvisingDetail> {
  return http.get<AdvisingDetail>(`/api/student/advising-requests/${requestId}`);
}

/**
 * `POST /api/student/advising-requests`
 *
 * The backend assigns the request to the student's own advisor, so only a
 * title and a description are needed.
 */
export async function createAdvisingRequest(input: {
  title: string;
  description: string;
}): Promise<{ id: string; status: string; advisorId: string }> {
  return http.post<{ id: string; status: string; advisorId: string }>(
    "/api/student/advising-requests",
    { title: input.title, description: input.description },
  );
}

/**
 * `POST /api/student/advising-requests/{id}/messages`
 *
 * Returns the whole conversation so the screen can replace its list in one
 * shot.
 */
export async function sendAdvisingMessage(
  requestId: string,
  content: string,
): Promise<AdvisingDetail> {
  return http.post<AdvisingDetail>(
    `/api/student/advising-requests/${requestId}/messages`,
    { content },
  );
}

/** `PATCH /api/student/advising-requests/{id}/cancel` */
export async function cancelAdvisingRequest(
  requestId: string,
): Promise<AdvisingDetail> {
  return http.patch<AdvisingDetail>(
    `/api/student/advising-requests/${requestId}/cancel`,
  );
}
