import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../shared/lib/baseApi'
import '../features/auth/authApi'
import '../features/studentQuizzes/studentQuizzesApi'
import '../features/adminFollowUp/adminFollowUpApi'
import '../features/adminQuizzes/adminQuizzesApi'
import '../features/questionBank/questionBankApi'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
