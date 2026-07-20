import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
    reducerPath: 'api', 
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
        prepareHeaders: (headers) => {
            const studentId = import.meta.env.VITE_MOCK_STUDENT_ID
            if(studentId) {
                headers.set('x-student-id', studentId)
            }
            return headers
        }
    }),
    endpoints: () => ({}), 
})