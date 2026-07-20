import React from "react";
import { useGetStudentQuizzesQuery } from "../studentQuizzesApi";
import QuizCard from "./QuizCard";

export default function QuizzesList() {
  const { data, isLoading, isError, error } = useGetStudentQuizzesQuery();

  if (isLoading) return <p>Loading</p>;
  if (isError) return <p>Something went wrong</p>;

  const quizzes = data?.quizzes ?? [];
  if (quizzes.length === 0) return <p>No quizzes yet.</p>;

  return quizzes.map((quiz) =>  (
    <QuizCard key={quiz.quizId} quiz={quiz} />));
}
