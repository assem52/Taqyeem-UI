// @ts-check
import { baseApi } from "../../shared/lib/baseApi";

export const studentQuizzesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getStudentQuizzes: build.query({
            query: () => '/student/quizzes', 
        }),
        getStudentQuiz: build.query({
            query: (quizId) => `/student/quizzes/${quizId}`,
        }),
        getInvitation: build.query({
            query: (token) => `/student/invitations/${token}`,
        }),
        startAttempt: build.mutation({
            query: (quizId) => ({
                url: `/student/quizzes/${quizId}/attempts`,
                method: 'POST',
            }),
        }),
        getAttempt: build.query({
            query: (quizId) => `/student/quizzes/${quizId}/attempt`,
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