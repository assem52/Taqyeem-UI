export const FOLLOW_UP_REASON = {
  DID_NOT_START: 'DID_NOT_START',
  STARTED_NOT_SUBMITTED: 'STARTED_NOT_SUBMITTED',
  FAILED: 'FAILED',
  FLAGGED_FOR_REVIEW: 'FLAGGED_FOR_REVIEW',
  LOW_SCORE: 'LOW_SCORE',
} as const

export type FollowUpReason =
  (typeof FOLLOW_UP_REASON)[keyof typeof FOLLOW_UP_REASON]

export type AttemptStatus =
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'AUTO_SUBMITTED'

export interface FollowUpLearner {
  studentId: string
  studentName: string
  studentEmail: string
  quizId: string
  quizTitle: string
  attemptId?: string | null
  score: number | null
  submittedAt: string | null
  attemptStatus: AttemptStatus | null
  nextStep: string
  integrityReviewNote?: string
}

export interface FollowUpGroup {
  reason: FollowUpReason
  label: string
  count: number
  learners: FollowUpLearner[]
}

export interface FollowUpSummary {
  total: number
  byReason: Record<FollowUpReason, number>
}

export interface FollowUpListResponse {
  generatedAt: string
  summary: FollowUpSummary
  groups: FollowUpGroup[]
}

export interface FollowUpListQuery {
  quizId?: string
}
