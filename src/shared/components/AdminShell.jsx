import AppShell from './AppShell';

export default function AdminShell({ title, subtitle, actions, children, wide = false }) {
  return (
    <AppShell
      variant="admin"
      title={title}
      subtitle={subtitle}
      actions={actions}
      wide={wide}
    >
      {children}
    </AppShell>
  );
}
