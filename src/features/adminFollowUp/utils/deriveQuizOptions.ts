import type { FollowUpGroup } from '../../../shared/models/dto/adminFollowUp.dto'

export interface QuizOption {
  quizId: string
  quizTitle: string
}

export function deriveQuizOptions(groups: FollowUpGroup[]): QuizOption[] {
  const quizzes = new Map<string, string>()

  for (const group of groups) {
    for (const learner of group.learners) {
      quizzes.set(learner.quizId, learner.quizTitle)
    }
  }

  return Array.from(quizzes, ([quizId, quizTitle]) => ({
    quizId,
    quizTitle,
  })).sort((left, right) => left.quizTitle.localeCompare(right.quizTitle))
}
