import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../shared/lib/baseApi'
import '../features/studentQuizzes/studentQuizzesApi'
import '../features/adminFollowUp/adminFollowUpApi'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
