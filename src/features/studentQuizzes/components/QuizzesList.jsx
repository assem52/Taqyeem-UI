import { useGetStudentQuizzesQuery } from '../studentQuizzesApi'
import QuizCard from './QuizCard'

export default function QuizzesList() {
  const { data, isLoading, isError } = useGetStudentQuizzesQuery()

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading your quizzes…</p>
  }

  if (isError) {
    return (
      <p className="text-sm text-red-700">
        Something went wrong loading your quizzes. Please try again.
      </p>
    )
  }

  const quizzes = data?.quizzes ?? []

  if (quizzes.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        You have no quizzes yet. When you are invited to a published quiz, it
        will show up here.
      </p>
    )
  }

  return (
    <ul className="flex list-none flex-col gap-3 p-0">
      {quizzes.map((quiz) => (
        <li key={quiz.quizId}>
          <QuizCard quiz={quiz} />
        </li>
      ))}
    </ul>
  )
}
