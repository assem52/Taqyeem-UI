import { baseApi } from '../../shared/lib/baseApi';

const bankListTags = [{ type: 'BankQuestions', id: 'LIST' }, 'BankCategories'];

export const globalQuestionBankApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBankCategories: build.query({
      query: () => '/admin/question-bank/categories',
      providesTags: ['BankCategories'],
    }),
    createBankCategory: build.mutation({
      query: (body) => ({
        url: '/admin/question-bank/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BankCategories'],
    }),
    getBankQuestions: build.query({
      query: ({ categoryId, q } = {}) => {
        const params = new URLSearchParams();
        if (categoryId) params.set('categoryId', categoryId);
        if (q?.trim()) params.set('q', q.trim());
        const queryString = params.toString();
        return `/admin/question-bank/questions${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((question) => ({
                type: 'BankQuestions',
                id: question.bankQuestionId,
              })),
              { type: 'BankQuestions', id: 'LIST' },
            ]
          : [{ type: 'BankQuestions', id: 'LIST' }],
    }),
    createBankQuestion: build.mutation({
      query: (body) => ({
        url: '/admin/question-bank/questions',
        method: 'POST',
        body,
      }),
      invalidatesTags: bankListTags,
    }),
    updateBankQuestion: build.mutation({
      query: ({ bankQuestionId, body }) => ({
        url: `/admin/question-bank/questions/${bankQuestionId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: bankListTags,
    }),
    removeBankQuestion: build.mutation({
      query: (bankQuestionId) => ({
        url: `/admin/question-bank/questions/${bankQuestionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: bankListTags,
    }),
    addQuestionsFromBank: build.mutation({
      query: ({ quizId, bankQuestionIds }) => ({
        url: `/admin/quizzes/${quizId}/questions/from-bank`,
        method: 'POST',
        body: { bankQuestionIds },
      }),
      invalidatesTags: (result, error, { quizId }) => [
        { type: 'Questions', id: quizId },
        { type: 'Quiz', id: quizId },
        'Quizzes',
      ],
    }),
  }),
});

export const {
  useGetBankCategoriesQuery,
  useCreateBankCategoryMutation,
  useGetBankQuestionsQuery,
  useCreateBankQuestionMutation,
  useUpdateBankQuestionMutation,
  useRemoveBankQuestionMutation,
  useAddQuestionsFromBankMutation,
} = globalQuestionBankApi;
