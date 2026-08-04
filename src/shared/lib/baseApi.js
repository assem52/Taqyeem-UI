import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
    reducerPath: 'api',
    tagTypes: ['Quizzes', 'Quiz', 'Invitations'],
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
        prepareHeaders: (headers) => {
            const studentId = import.meta.env.VITE_MOCK_STUDENT_ID;
            if (studentId) {
                headers.set('x-student-id', studentId);
            }
            const adminToken = import.meta.env.VITE_ADMIN_TOKEN;
            if (import.meta.env.DEV && adminToken) {
                headers.set('x-admin-token', adminToken);
            }
            const jwtToken = localStorage.getItem('token');
            if (jwtToken) {
                headers.set('authorization', `Bearer ${jwtToken}`);
            }
            return headers;
        }
    }),
    endpoints: () => ({}), 
})