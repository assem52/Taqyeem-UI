import { baseApi } from '../../shared/lib/baseApi'
import type {
  FollowUpListQuery,
  FollowUpListResponse,
} from '../../shared/models/dto/adminFollowUp.dto'

export const adminFollowUpApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminFollowUp: build.query<
      FollowUpListResponse,
      FollowUpListQuery | void
    >({
      query: (query) => ({
        url: '/admin/follow-up',
        params: query?.quizId ? { quizId: query.quizId } : undefined,
      }),
    }),
  }),
})

export const { useGetAdminFollowUpQuery } = adminFollowUpApi
