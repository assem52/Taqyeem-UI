import { baseApi } from '../../shared/lib/baseApi';

const questionTags = (quizId) => [
  { type: 'Questions', id: quizId },
  { type: 'Quiz', id: quizId },
  'Quizzes',
];

export const questionBankApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getQuizQuestions: build.query({
      query: (quizId) => `/admin/quizzes/${quizId}/questions`,
      providesTags: (result, error, quizId) => [{ type: 'Questions', id: quizId }],
    }),
    createQuestion: build.mutation({
      query: ({ quizId, body }) => ({
        url: `/admin/quizzes/${quizId}/questions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { quizId }) => questionTags(quizId),
    }),
    updateQuestion: build.mutation({
      query: ({ quizId, questionId, body }) => ({
        url: `/admin/quizzes/${quizId}/questions/${questionId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { quizId }) => questionTags(quizId),
    }),
    reorderQuestions: build.mutation({
      query: ({ quizId, questionIds }) => ({
        url: `/admin/quizzes/${quizId}/questions/reorder`,
        method: 'PATCH',
        body: { questionIds },
      }),
      invalidatesTags: (result, error, { quizId }) => questionTags(quizId),
    }),
    setQuestionVisibility: build.mutation({
      query: ({ quizId, questionId, isHidden }) => ({
        url: `/admin/quizzes/${quizId}/questions/${questionId}/visibility`,
        method: 'PATCH',
        body: { isHidden },
      }),
      invalidatesTags: (result, error, { quizId }) => questionTags(quizId),
    }),
    removeQuestion: build.mutation({
      query: ({ quizId, questionId }) => ({
        url: `/admin/quizzes/${quizId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { quizId }) => questionTags(quizId),
    }),
    duplicateQuiz: build.mutation({
      query: (quizId) => ({
        url: `/admin/quizzes/${quizId}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Quizzes'],
    }),
  }),
});

export const {
  useGetQuizQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useReorderQuestionsMutation,
  useSetQuestionVisibilityMutation,
  useRemoveQuestionMutation,
  useDuplicateQuizMutation,
} = questionBankApi;
