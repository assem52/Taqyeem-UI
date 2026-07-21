import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../shared/lib/baseApi'
import '../features/studentQuizzes/studentQuizzesApi'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
