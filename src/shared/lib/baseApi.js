import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBase = import.meta.env.VITE_API_BASE_URL;
if (!apiBase && import.meta.env.PROD) {
  throw new Error(
    'VITE_API_BASE_URL must be set for production builds of Taqyem.',
  );
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBase || 'http://localhost:3000',
  prepareHeaders: (headers) => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      headers.set('authorization', `Bearer ${jwtToken}`);
    }

    // DEV-only mock identity — never applied in production builds.
    if (import.meta.env.DEV) {
      const studentId = import.meta.env.VITE_MOCK_STUDENT_ID;
      if (studentId) {
        headers.set('x-student-id', studentId);
      }
      const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
      if (adminToken) {
        headers.set('x-admin-token', adminToken);
      }
    }

    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const isAuthRequest =
    typeof args === 'string'
      ? args.includes('/auth/')
      : args?.url?.includes('/auth/');

  if (result.error && result.error.status === 401 && !isAuthRequest) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('status');
    localStorage.removeItem('email');
    window.location.href = '/login';
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: [
    'StudentQuizzes',
    'StudentQuiz',
    'Attempt',
    'QuizResults',
    'AdminFollowUp',
    'Quiz',
    'Quizzes',
    'Questions',
    'BankQuestions',
    'BankCategories',
    'Invitations',
    'QuizAnalytics',
    'QuestionAnalytics',
    'QuizAttempts',
    'AttemptReview',
  ],
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
