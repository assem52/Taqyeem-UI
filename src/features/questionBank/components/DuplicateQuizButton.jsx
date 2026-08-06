import { useNavigate } from 'react-router-dom';
import { useDuplicateQuizMutation } from '../questionBankApi';

function duplicatedQuizId(result) {
  const quiz = result?.quiz ?? result?.data ?? result;
  return quiz?.quizId ?? quiz?.id;
}

function errorMessage(error) {
  const message = error?.data?.message ?? error?.data?.error;
  return Array.isArray(message) ? message.join(' ') : message || 'Failed to duplicate quiz.';
}

export default function DuplicateQuizButton({
  quiz,
  onError,
  className = '',
  children = 'Duplicate',
}) {
  const navigate = useNavigate();
  const [duplicateQuiz, { isLoading }] = useDuplicateQuizMutation();

  const handleDuplicate = async () => {
    const quizId = quiz?.quizId ?? quiz?.id;
    if (!quizId) return;

    if (
      !window.confirm(
        `Duplicate "${quiz.title || 'this quiz'}" with all of its questions?`,
      )
    ) {
      return;
    }

    onError?.('');
    try {
      const result = await duplicateQuiz(quizId).unwrap();
      const newQuizId = duplicatedQuizId(result);
      if (newQuizId) {
        navigate(`/admin/quizzes/${newQuizId}/questions`, {
          state: { notice: 'Quiz duplicated. You are editing the new copy.' },
        });
      } else {
        navigate('/admin/quizzes', {
          state: { notice: 'Quiz duplicated successfully.' },
        });
      }
    } catch (error) {
      onError?.(errorMessage(error));
    }
  };

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isLoading}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {isLoading ? 'Duplicating…' : children}
    </button>
  );
}
