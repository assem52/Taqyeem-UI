import { useNavigate } from 'react-router-dom';
import QuizzesList from '../components/QuizzesList';
import AppHeader from '../../../shared/components/AppHeader';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      {/* Page Header */}
      <header className="bg-surface border-border border-b px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <div>
            <h1 className="text-heading text-2xl font-bold tracking-tight">My Quizzes</h1>
            <p className="text-muted text-sm mt-1">
              Quizzes you are enrolled in, with your current status.
            </p>
          </div>
          
          {/* Sign in button*/}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <QuizzesList />
        </div>
      </main>
    </div>
  );
}