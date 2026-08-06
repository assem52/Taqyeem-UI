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
            query: ({ attemptId, questionId, selectedOptionId }) => ({
                url: `/attempts/${attemptId}/answers/${questionId}`,
                method: 'PUT',
                body: { selectedOptionId },
            }),
        }),
        submitAttempt: build.mutation({
            query: (attemptId) => ({
                url: `/attempts/${attemptId}/submit`,
                method: 'POST',
            }),
            invalidatesTags: ['StudentQuizzes', 'StudentQuiz', 'Attempt'],
        }),
    }),
})

export const { 
    useGetStudentQuizzesQuery, 
    useGetStudentQuizQuery, 
    useGetInvitationQuery,
    useStartAttemptMutation,
    useGetAttemptQuery,
    useSaveAnswerMutation,
    useSubmitAttemptMutation
} = studentQuizzesApi;