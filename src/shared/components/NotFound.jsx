import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Page not found</h1>
      <Link to="/" className="text-sm text-slate-700 underline">
        Back to dashboard
      </Link>
    </main>
  )
}
