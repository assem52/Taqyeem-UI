import React from 'react'
import { useParams } from 'react-router-dom';

export default function QuizGatewayPage() {
    const {quizId} = useParams();
  return (
    <div>QuizGatewayPage: {quizId}</div>
  )
}
