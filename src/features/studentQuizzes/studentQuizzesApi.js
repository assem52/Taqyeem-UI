// @ts-check
import { baseApi } from "../../shared/lib/baseApi";

export const studentQuizzesApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getStudentQuizzes: build.query({
            query: () => 'student/quizzes', 
        }),
    }),
})

export const { useGetStudentQuizzesQuery } = studentQuizzesApi;