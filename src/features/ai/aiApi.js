import { baseApi } from '../../shared/lib/baseApi';

export const aiApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendChatMessage: build.mutation({
      query: (body) => ({
        url: '/chat',
        method: 'POST',
        body,
      }),
    }),
    generateAiQuestions: build.mutation({
      query: (formData) => ({
        url: '/admin/ai/generate-questions',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useSendChatMessageMutation,
  useGenerateAiQuestionsMutation,
} = aiApi;
