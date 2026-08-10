import { Link, useLocation } from 'react-router-dom';
import { clearAuthSession } from '../utils/authSession';
import AppShell from './AppShell';

const NAV = [
  { to: '/admin/quizzes', label: 'Quizzes', match: (path) => path.startsWith('/admin/quizzes') },
  { to: '/admin/follow-up', label: 'Follow-up', match: (path) => path.startsWith('/admin/follow-up') },
];

function logout() {
  clearAuthSession();
  window.location.href = '/login';
}

export default function AdminShell({ title, subtitle, actions, children }) {
  return (
    <AppShell
      variant="admin"
      title={title}
      subtitle={subtitle}
      actions={actions}
    >
      {children}
    </AppShell>
  );
}
