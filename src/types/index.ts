// ============================================================
// FAAPS-mobile domain types.
//
// These mirror the FAAPS backend contracts one-to-one: every field name
// comes straight from a backend record (Spring `record` components are
// serialised as camelCase by Jackson).
// ============================================================

export type RoleCode = "ADMIN" | "ADVISOR" | "STUDENT";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

export type AcademicStatus =
  | "ACTIVE"
  | "PROBATION"
  | "SUSPENDED"
  | "GRADUATED"
  | "WITHDRAWN"
  | "LEAVE_OF_ABSENCE";

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

/** `AuthSession` — returned by login / refresh / me. */
export interface AuthSession {
  id: string;
  fullName: string;
  email: string;
  role: RoleCode | string;
  status: UserStatus | string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// ------------------------------------------------------------
// Student profile
// ------------------------------------------------------------

/** `StudentAcademicService.Profile` */
export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  accountStatus: string;
  studentCode: string | null;
  majorId: string | null;
  majorCode: string | null;
  majorName: string | null;
  curriculumVersionId: string | null;
  cohort: string | null;
  currentSemester: number | null;
  currentGpa: number | null;
  totalCreditsEarned: number | null;
  academicStatus: AcademicStatus | string | null;
  dateOfBirth: string | null;
}

export interface UpdateProfileInput {
  fullName: string;
  phone?: string;
}

/** `StudentAdvisorService.Advisor` */
export interface StudentAdvisor {
  id: string;
  advisorCode: string;
  fullName: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  maxAdvisees: number;
  status: string;
  assignmentStartDate: string | null;
  assignedDate: string | null;
  groupName: string | null;
  isPrimary: boolean;
}

// ------------------------------------------------------------
// Academic progress
// ------------------------------------------------------------

/** `StudentAcademicService.SemesterSummary` */
export interface SemesterSummary {
  code: string;
  name: string;
  creditsEnrolled: number;
  creditsEarned: number;
  semesterGpa: number | null;
  cumulativeGpa: number | null;
  standing: string | null;
}

/** `StudentAcademicService.Progress` */
export interface AcademicProgress {
  requiredCredits: number;
  earnedCredits: number;
  curriculumCourses: number;
  currentGpa: number | null;
  completedCourses: number;
  semesters: SemesterSummary[];
}

/** `StudentAcademicService.TranscriptRow` */
export interface TranscriptRow {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  semesterCode: string;
  semesterName: string;
  finalScore: number | null;
  status: string;
  attemptNumber: number;
  creditsEarned: number;
}

/** `StudentAcademicService.Curriculum` */
export interface Curriculum {
  id: string;
  version: string;
  name: string;
  description: string | null;
  majorCode: string;
  majorName: string;
}

/** `StudentAcademicService.CurriculumCourse` */
export interface CurriculumCourse {
  courseId: string;
  code: string;
  name: string;
  credits: number;
  semesterNumber: number;
  mandatory: boolean;
  groupName: string | null;
}

// ------------------------------------------------------------
// Study plans
// ------------------------------------------------------------

/** `StudentPlanDtos.Semester` */
export interface PlanSemester {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
}

/** `StudentPlanDtos.PlanHeader` */
export interface PlanHeader {
  id: string;
  semesterId: string;
  semesterCode: string;
  version: number;
  status: string;
  planType: string;
  totalCredits: number;
  previousPlanId: string | null;
  submittedAt: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
}

/** `StudentPlanDtos.PlanCourse` */
export interface PlanCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  priority: string | null;
  notes: string | null;
}

/** `StudentPlanDtos.CurriculumPlan` */
export interface CurriculumPlan {
  header: PlanHeader;
  courses: PlanCourse[];
  issues: string[];
}

// ------------------------------------------------------------
// Advising
// ------------------------------------------------------------

/** `AdvisingConversationService.Request` */
export interface AdvisingRequest {
  id: string;
  studentId: string;
  studentName: string;
  advisorId: string;
  advisorName: string;
  title: string;
  description: string;
  requestType: string;
  status: string;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `AdvisingConversationService.Message` */
export interface AdvisingMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  internal: boolean;
  createdAt: string;
}

/** `AdvisingConversationService.Detail` */
export interface AdvisingDetail {
  request: AdvisingRequest;
  messages: AdvisingMessage[];
}

// ------------------------------------------------------------
// Appointments
// ------------------------------------------------------------

/** `AppointmentDtos.AvailableSlotDto` — ISO local date-times. */
export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

/** `AppointmentDtos.BookedAppointmentDto` */
export interface BookedAppointment {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  advisorId: string;
  advisorName: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
  decisionNote: string | null;
  createdAt: string;
}

export interface BookAppointmentInput {
  advisorId?: string;
  startTime: string;
  reason: string;
}

// ------------------------------------------------------------
// Notifications
// ------------------------------------------------------------

export type NotificationType =
  | "INFO"
  | "WARNING"
  | "REMINDER"
  | "PLAN_STATUS"
  | "MESSAGE"
  | "ADVISOR_REQUEST";

/** `NotificationService.Item` */
export interface AppNotification {
  id: string;
  recipientUserId: string;
  notificationType: NotificationType | string;
  title: string;
  message: string;
  actionUrl: string | null;
  relatedStudentId: string | null;
  resolvedAt: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/** `NotificationService.Page` */
export interface NotificationPage {
  items: AppNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
