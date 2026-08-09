// @ts-check
import { baseApi } from "../../shared/lib/baseApi";

export const studentQuizzesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getStudentQuizzes: build.query({
            query: () => '/student/quizzes', 
            providesTags: ['StudentQuizzes'],
        }),
        getStudentQuiz: build.query({
            query: (quizId) => `/student/quizzes/${quizId}`,
            providesTags: (result, error, quizId) => [{ type: 'StudentQuiz', id: quizId }],
        }),
        getQuizResults: build.query({
            query: (quizId) => `/student/quizzes/${quizId}/results`,
            providesTags: (result, error, quizId) => [{ type: 'QuizResults', id: quizId }],
        }),
        getInvitation: build.query({
            query: (token) => `/student/invitations/${token}`,
        }),
        startAttempt: build.mutation({
            query: (quizId) => ({
                url: '/attempts',
                method: 'POST',
                body: { quizId },
            }),
            invalidatesTags: (result, error, quizId) => [
                'StudentQuizzes',
                { type: 'StudentQuiz', id: quizId },
                { type: 'Attempt', id: quizId },
            ],
        }),
        getAttempt: build.query({
            query: (quizId) => `/student/quizzes/${quizId}/attempt`,
            providesTags: (result, error, quizId) => [{ type: 'Attempt', id: quizId }],
        }),
        saveAnswer: build.mutation({
            query: ({ attemptId, questionId, selectedOptionId, textAnswer }) => ({
                url: `/attempts/${attemptId}/answers/${questionId}`,
                method: 'PUT',
                body: {
                    selectedOptionId: selectedOptionId ?? null,
                    textAnswer: textAnswer ?? null,
                },
            }),
        }),
        submitAttempt: build.mutation({
            query: (attemptId) => ({
                url: `/attempts/${attemptId}/submit`,
                method: 'POST',
            }),
            invalidatesTags: ['StudentQuizzes', 'StudentQuiz', 'Attempt', 'QuizResults'],
        }),
        recordVisibilityLost: build.mutation({
            query: (attemptId) => ({
                url: `/attempts/${attemptId}/integrity-events/visibility-lost`,
                method: 'POST',
            }),
        }),
    }),
})

export const { 
    useGetStudentQuizzesQuery, 
    useGetStudentQuizQuery,
    useGetQuizResultsQuery,
    useGetInvitationQuery,
    useStartAttemptMutation,
    useGetAttemptQuery,
    useSaveAnswerMutation,
    useSubmitAttemptMutation,
    useRecordVisibilityLostMutation,
} = studentQuizzesApi;
