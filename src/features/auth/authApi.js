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
    resendVerification: builder.mutation({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
    }),
<<<<<<< HEAD
=======
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
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
  useResendVerificationMutation,
<<<<<<< HEAD
=======
  useForgotPasswordMutation,
  useResetPasswordMutation,
>>>>>>> 12f68d40c1a96f0d9726d37f4cc5c1af22f807b7
  useGetMeQuery,
  useAcceptInvitationMutation,
} = authApi;
