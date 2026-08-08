import { Link } from 'react-router-dom';
import { Search, Bell } from './Icons';

export default function AppHeader() {
  return (
    <header className="bg-surface border-border sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Brand logo & platform title */}
        <Link to="/" className="flex items-center gap-3 focus:outline-none">
          <div className="bg-primary h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-soft">
            QP
          </div>
          <span className="text-lg font-bold tracking-tight text-heading">QuizPlatform</span>
        </Link>

        {/* Global Search Placeholder */}
        <div className="hidden md:flex relative group ml-4">
          <Search size={16} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search across platform (Cmd+K)"
            className="bg-background border-border placeholder:text-muted h-9 w-64 rounded-input border pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          type="button" 
          className="p-2 text-muted hover:text-heading relative rounded-full hover:bg-background transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="bg-danger absolute right-2 top-2 h-2 w-2 rounded-full border border-surface"></span>
        </button>

        <button
          type="button"
          className="text-sm font-medium text-muted hover:text-heading px-2 py-1 rounded-md hover:bg-background"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
          }}
        >
          Log out
        </button>

        {/* Profile Avatar / User Badge */}
        <div 
          className="h-8 w-8 rounded-full bg-primary-soft text-primary font-medium text-sm flex items-center justify-center border border-border" 
          aria-label="User Profile"
        >
          ST
        </div>
      </div>
    </header>
  );
}
