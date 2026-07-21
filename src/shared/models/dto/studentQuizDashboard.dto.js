/**
 * Mirrors backend: src/modules/student-quizzes/dto/student-quiz-dashboard.dto.ts
 *
 * @typedef {import('../enums/studentQuizState').StudentQuizState} StudentQuizState
 *
 * @typedef {Object} StudentQuizDashboardItem
 * @property {string} quizId
 * @property {string} title
 * @property {string} description
 * @property {string} closesAt
 * @property {StudentQuizState} studentState
 * @property {number|null} score
 * @property {boolean} canStart
 * @property {string} [blockedReason]
 *
 * @typedef {Object} StudentQuizDashboard
 * @property {StudentQuizDashboardItem[]} quizzes
 */

export {}
