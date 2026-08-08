import { baseApi } from '../../shared/lib/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: '/auth/verify',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
    }),
    acceptInvitation: builder.mutation({
      query: (token) => ({
        url: `/student/invitations/${token}/accept`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useGetMeQuery,
  useAcceptInvitationMutation,
} = authApi;
