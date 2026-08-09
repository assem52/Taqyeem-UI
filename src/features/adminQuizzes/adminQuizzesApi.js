import { baseApi } from '../../shared/lib/baseApi';

export const adminQuizzesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminQuizzes: build.query({
      query: ({ search, status } = {}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status && status !== 'ALL') params.append('status', status);
        const queryString = params.toString();
        return `/admin/quizzes${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Quizzes'],
    }),

    getAdminQuizById: build.query({
      query: (id) => `/admin/quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    createQuiz: build.mutation({
      query: (body) => ({
        url: '/admin/quizzes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Quizzes'],
    }),

    updateQuiz: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/quizzes/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Quizzes', { type: 'Quiz', id }],
    }),

    publishQuiz: build.mutation({
      query: (id) => ({
        url: `/admin/quizzes/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => ['Quizzes', { type: 'Quiz', id }],
    }),

    unpublishQuiz: build.mutation({
      query: (id) => ({
        url: `/admin/quizzes/${id}/unpublish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => ['Quizzes', { type: 'Quiz', id }],
    }),

    deleteQuiz: build.mutation({
      query: (id) => ({
        url: `/admin/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quizzes'],
    }),

    getQuizInvitations: build.query({
      query: (quizId) => `/admin/quizzes/${quizId}/invitations`,
      providesTags: (result, error, quizId) => [{ type: 'Invitations', id: quizId }],
    }),

    bulkInviteStudents: build.mutation({
      query: ({ quizId, emails }) => ({
        url: `/admin/quizzes/${quizId}/invitations/bulk`,
        method: 'POST',
        body: { emails },
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: 'Invitations', id: quizId },
      ],
    }),

    getQuizAnalytics: build.query({
      query: (quizId) => `/analytics/quiz/${quizId}`,
      providesTags: (result, error, quizId) => [{ type: 'QuizAnalytics', id: quizId }],
    }),

    getQuestionAnalytics: build.query({
      query: (quizId) => `/question-analytics/quiz/${quizId}`,
      providesTags: (result, error, quizId) => [{ type: 'QuestionAnalytics', id: quizId }],
    }),

    getQuizAttempts: build.query({
      query: (quizId) => `/admin/quizzes/${quizId}/attempts`,
      providesTags: (result, error, quizId) => [{ type: 'QuizAttempts', id: quizId }],
    }),

    getAdminAttemptReview: build.query({
      query: (attemptId) => `/admin/attempts/${attemptId}`,
      providesTags: (result, error, attemptId) => [{ type: 'AttemptReview', id: attemptId }],
    }),
  }),
});

export const {
  useGetAdminQuizzesQuery,
  useGetAdminQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  usePublishQuizMutation,
  useUnpublishQuizMutation,
  useDeleteQuizMutation,
  useGetQuizInvitationsQuery,
  useBulkInviteStudentsMutation,
  useGetQuizAnalyticsQuery,
  useGetQuestionAnalyticsQuery,
  useGetQuizAttemptsQuery,
  useGetAdminAttemptReviewQuery,
} = adminQuizzesApi;
