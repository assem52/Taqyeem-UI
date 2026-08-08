import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
    prepareHeaders: (headers) => {
        const studentId = import.meta.env.VITE_MOCK_STUDENT_ID;
        if (studentId) {
            headers.set('x-student-id', studentId);
        }
        if (import.meta.env.DEV) {
            const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
            if (adminToken) {
                headers.set('x-admin-token', adminToken);
            }
        }
        const jwtToken = localStorage.getItem('token');
        if (jwtToken) {
            headers.set('authorization', `Bearer ${jwtToken}`);
        }
        return headers;
    }
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    const isAuthRequest = typeof args === 'string'
      ? args.includes('/auth/')
      : args?.url?.includes('/auth/');

    if (result.error && result.error.status === 401 && !isAuthRequest) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    tagTypes: ['StudentQuizzes', 'StudentQuiz', 'Attempt', 'AdminFollowUp'],
    baseQuery: baseQueryWithReauth, 
    endpoints: () => ({}), 
});