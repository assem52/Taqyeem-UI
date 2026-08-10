import AppShell from './AppShell';

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
