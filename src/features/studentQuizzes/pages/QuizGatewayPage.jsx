import { useParams } from 'react-router-dom'
import { useGetStudentQuizzesQuery } from '../studentQuizzesApi'

export default function QuizGatewayPage() {
  const { quizId } = useParams()              
  const { data, isLoading } = useGetStudentQuizzesQuery()

  if (isLoading) return <p>Loading…</p>

  const quiz = data?.quizzes.find((q) => q.quizId === quizId)

  if (!quiz) return <p>Quiz not found</p>
  if (!quiz.canStart) return <p>{quiz.blockedReason}</p>

  return <p>You can start: {quiz.title}</p> 
}