import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetMeQuery } from '../../auth/authApi';
import {
  Clock,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from '../../../shared/components/Icons';

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoTab, setDemoTab] = useState('learner');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const storedName = typeof window !== 'undefined' ? localStorage.getItem('name') : null;
  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  const { data: meData, isError: isMeError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const isAuthenticated = Boolean(token) && !isMeError;
  const currentRole = meData?.role || storedRole || 'STUDENT';
  const displayName = meData?.name || storedName || (meData?.email || storedEmail || '').split('@')[0] || '';
  const userInitials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const dashboardRoute = currentRole === 'ADMIN' ? '/admin/quizzes' : '/dashboard';
  const dashboardText = currentRole === 'ADMIN' ? 'Admin Workspace' : 'Dashboard';

  return (
    <div className="min-h-screen bg-background text-body font-sans antialiased">
      {/* =========================================================
                         1. PUBLIC NAVBAR
         ========================================================= */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-heading transition-opacity hover:opacity-90"
            aria-label="Taqyem Home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-soft">
              T
            </span>
            <span className="font-display">Taqyem</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted transition-colors hover:text-heading"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted transition-colors hover:text-heading"
            >
              How It Works
            </a>
            <a
              href="#for-admins"
              className="text-sm font-medium text-muted transition-colors hover:text-heading"
            >
              For Instructors
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                {displayName ? (
                  <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading shadow-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
                      {userInitials}
                    </span>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                  </span>
                ) : null}
                <Link
                  to={dashboardRoute}
                  className="rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover"
                >
                  {dashboardText}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-button px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-background"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-button bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-button border border-border bg-surface p-2 text-muted transition-colors hover:text-heading md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-surface px-4 pb-6 pt-3 md:hidden">
            <nav className="flex flex-col space-y-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-heading transition-colors hover:bg-background"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-heading transition-colors hover:bg-background"
              >
                How It Works
              </a>
              <a
                href="#for-admins"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-heading transition-colors hover:bg-background"
              >
                For Instructors
              </a>
            </nav>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
              {isAuthenticated ? (
                <>
                  {displayName ? (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5 text-xs font-semibold text-heading">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {userInitials}
                      </span>
                      <span className="truncate">{displayName}</span>
                    </div>
                  ) : null}
                  <Link
                    to={dashboardRoute}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-button bg-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Go to {dashboardText}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-button border border-border bg-surface py-2.5 text-center text-sm font-semibold text-heading hover:bg-background"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-button bg-primary py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
                         2. HERO SECTION
         ========================================================= */}
      <main>
        <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-24">
          {/* Subtle Background Glow Radial */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(340 18% 42% / 0.12), transparent 70%)',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/80 px-3.5 py-1 text-xs font-semibold text-primary">
                  <Sparkles size={14} />
                  <span>Cohort Learning & Timed Assessment Platform</span>
                </div>

                <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-heading sm:text-5xl lg:text-5xl leading-[1.15]">
                  Smart, Timed & Fair Learning Assessments
                </h1>

                <p className="mt-5 text-base leading-relaxed text-body sm:text-lg">
                  Deliver server-authoritative timed quizzes, monitor real-time attempt progress, and enforce fair exam conditions with automated visibility capture.
                </p>

                {/* Primary & Secondary Call to Actions */}
                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={dashboardRoute}
                        className="inline-flex items-center justify-center rounded-button bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <span>Go to {dashboardText}</span>
                        <ChevronRight size={16} className="ml-1.5" />
                      </Link>

                      <a
                        href="#features"
                        className="inline-flex items-center justify-center rounded-button border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-heading transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        Explore Platform Features
                      </a>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center rounded-button bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <span>Get Started</span>
                        <ChevronRight size={16} className="ml-1.5" />
                      </Link>

                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-button border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-heading transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        Sign In to Account
                      </Link>
                    </>
                  )}
                </div>

                {/* Value / Trust Points */}
                <div className="mt-10 grid grid-cols-1 gap-4 border-t border-border/80 pt-8 sm:grid-cols-3">
                  <div className="flex items-start gap-2.5">
                    <Clock size={18} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <h2 className="text-xs font-bold text-heading uppercase tracking-wider">Server Timed</h2>
                      <p className="mt-0.5 text-xs text-muted">Authoritative countdown</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <h2 className="text-xs font-bold text-heading uppercase tracking-wider">Fair & Secure</h2>
                      <p className="mt-0.5 text-xs text-muted">Visibility tracking</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <TrendingUp size={18} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <h2 className="text-xs font-bold text-heading uppercase tracking-wider">Live Analytics</h2>
                      <p className="mt-0.5 text-xs text-muted">Instant scoring feedback</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive UI Visual Representation */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-md rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xl transition-all">
                  {/* Mock Quiz Window Header */}
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-heading">Data Structures & Algorithms</h3>
                        <p className="text-[11px] text-muted">Midterm Cohort Assessment</p>
                      </div>
                    </div>
                    {/* Live Server Countdown Badge */}
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-bold text-danger animate-pulse">
                      <Clock size={13} />
                      <span>04:32 remaining</span>
                    </div>
                  </div>

                  {/* Mock Progress Bar */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted">
                      <span>Question 7 of 10</span>
                      <span className="text-heading">70% Answered</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background border border-border/50">
                      <div className="h-full w-[70%] bg-primary rounded-full" />
                    </div>
                  </div>

                  {/* Mock Question Body */}
                  <div className="mt-5 rounded-xl border border-border bg-background/50 p-4">
                    <span className="inline-block rounded bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                      Multiple Choice
                    </span>
                    <p className="mt-2 text-sm font-semibold text-heading leading-relaxed">
                      What is the worst-case time complexity of QuickSort when selecting an improper pivot?
                    </p>

                    {/* Mock Options */}
                    <div className="mt-3.5 space-y-2">
                      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-xs text-body transition-colors">
                        <span>A) O(n log n)</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-primary/50 bg-primary-soft/60 p-3 text-xs font-semibold text-heading shadow-xs">
                        <span>B) O(n²)</span>
                        <CheckCircle2 size={16} className="text-primary" />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-xs text-body">
                        <span>C) O(n)</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Action Controls */}
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <ShieldCheck size={12} className="text-success" />
                      Answer auto-saved
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled
                        className="rounded-button border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted opacity-60"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled
                        className="rounded-button bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-soft"
                      >
                        Next Question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
                           3. FEATURES SECTION
           ========================================================= */}
        <section id="features" className="border-t border-border bg-surface py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Core Capabilities
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-heading sm:text-4xl tracking-tight">
                Built for Reliable & Fair Cohort Assessments
              </h2>
              <p className="mt-4 text-base text-body leading-relaxed">
                Everything you need to deliver structured, server-timed quizzes with automated focus tracking and instant score analytics.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-heading">Server-Authoritative Timers</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  Countdown limits calculated on the server with 5-minute warnings, 1-minute danger alerts, and automatic submission upon expiration.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-heading">Fairness & Integrity Capture</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  Automated background monitoring of browser focus and tab switching to ensure transparent, cheat-resistant assessment sessions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <TrendingUp size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-heading">Live Progress & Instant Scoring</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  Real-time answered vs. unanswered question tracking during attempts with immediate score breakdown and review upon completion.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-heading">Question Bank & Workspace</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  Flexible quiz authoring supporting multiple-choice, true/false, and open-ended questions with customizable passing criteria.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-heading">Tokenized Invitations</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  Secure, token-based cohort invitation links that verify student credentials before granting timed access to exams.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/40 hover:shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-heading">Learner Follow-Up Insights</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">
                  Automated classification for instructors to identify top performers and learners needing extra encouragement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
                           4. HOW IT WORKS SECTION
           ========================================================= */}
        <section id="how-it-works" className="border-t border-border py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Simple 4-Step Learner Journey
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-heading sm:text-4xl tracking-tight">
                How Taqyem Operates for Students & Instructors
              </h2>
              <p className="mt-4 text-base text-body leading-relaxed">
                From receiving a tokenized invitation to reviewing immediate score breakdowns, the assessment experience is transparent and structured.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-primary/25">01</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <BookOpen size={20} />
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-heading">Get Access</h3>
                <p className="mt-2 text-xs text-body leading-relaxed">
                  Open the quiz via tokenized email invitation link or sign in to access enrolled assessments on your student dashboard.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-primary/25">02</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ShieldCheck size={20} />
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-heading">Review Instructions</h3>
                <p className="mt-2 text-xs text-body leading-relaxed">
                  Review exam guidelines, time limits, question formats, and passing requirements on the quiz gateway before starting.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-primary/25">03</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Clock size={20} />
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-heading">Take Assessment</h3>
                <p className="mt-2 text-xs text-body leading-relaxed">
                  Answer questions under server-authoritative countdowns with live progress tracking and automated focus capture.
                </p>
              </div>
              {/* Step 4 */}
              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-black text-primary/25">04</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-heading">Submit & Review</h3>
                <p className="mt-2 text-xs text-body leading-relaxed">
                  Submit attempt or auto-submit upon timer expiration, then access instant score reports and detailed answer reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
                           5. PLATFORM DEMO / PRODUCT PREVIEW SECTION
           ========================================================= */}
        <section id="demo" className="border-t border-border bg-surface py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* Section Header */}
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Interactive Product Preview
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-heading sm:text-4xl tracking-tight">
                See the Platform Experience in Action
              </h2>
              <p className="mt-4 text-base text-body leading-relaxed">
                A focused assessment interface built around clear progress tracking, server-authoritative timing, and structured cohort management.
              </p>

              {/* Demo Tab Switcher */}
              <div className="mt-8 inline-flex items-center rounded-xl border border-border bg-background p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setDemoTab('learner')}
                  className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                    demoTab === 'learner'
                      ? 'bg-surface text-heading shadow-soft border border-border'
                      : 'text-muted hover:text-heading'
                  }`}
                >
                  Learner Assessment View
                </button>
                <button
                  type="button"
                  onClick={() => setDemoTab('admin')}
                  className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${
                    demoTab === 'admin'
                      ? 'bg-surface text-heading shadow-soft border border-border'
                      : 'text-muted hover:text-heading'
                  }`}
                >
                  Instructor Workspace View
                </button>
              </div>
            </div>

            {/* Demo Preview Container */}
            <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
              {demoTab === 'learner' ? (
                /* Learner View Mock */
                <div className="p-6 sm:p-8">
                  <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-6 shadow-soft">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Active Attempt</span>
                        <h3 className="text-lg font-bold text-heading">Algorithms & Data Structures - Midterm</h3>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3.5 py-1 text-xs font-bold text-danger">
                        <Clock size={14} />
                        <span>04:32 remaining</span>
                        <span className="text-[9px] font-medium text-muted">(Server Controlled)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs font-semibold text-muted">
                        <span>Question 7 of 10</span>
                        <span className="text-heading">Answered 7 / 10 (70%)</span>
                      </div>
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-background border border-border">
                        <div className="h-full w-[70%] bg-primary rounded-full" />
                      </div>
                    </div>

                    {/* Question UI */}
                    <div className="mt-6 rounded-xl border border-border bg-background p-5">
                      <p className="text-sm font-semibold text-heading leading-relaxed">
                        Which architectural pattern ensures that the official assessment deadline remains reliable across different client devices?
                      </p>

                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5 text-xs text-body">
                          <span>A) Browser local storage timestamp calculation</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-primary/50 bg-primary-soft/70 p-3.5 text-xs font-semibold text-heading shadow-xs">
                          <span>B) Server-authoritative timing with central deadline validation</span>
                          <CheckCircle2 size={16} className="text-primary" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3.5 text-xs text-body">
                          <span>C) Client-side JavaScript setInterval loop</span>
                        </div>
                      </div>
                    </div>

                    {/* Controls & Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-xs text-muted flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-success" />
                        <span>Answer auto-saved & visibility monitored</span>
                      </span>
                      <div className="flex gap-2">
                        <button type="button" disabled className="rounded-button border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted opacity-60">
                          Previous
                        </button>
                        <button type="button" disabled className="rounded-button bg-primary px-4 py-2 text-xs font-semibold text-white shadow-soft">
                          Next Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Instructor View Mock */
                <div className="p-6 sm:p-8">
                  <div className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-6 shadow-soft">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Instructor Workspace</span>
                        <h3 className="text-lg font-bold text-heading">CS-101 Spring Cohort Assessments</h3>
                      </div>
                      <span className="inline-block rounded-full bg-success/10 border border-success/30 px-3 py-1 text-xs font-bold text-success">
                        Published & Active
                      </span>
                    </div>

                    {/* Stats Summary Grid */}
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-border bg-background p-3.5">
                        <p className="text-[10px] font-bold text-muted uppercase">Total Enrolled</p>
                        <p className="mt-1 text-xl font-extrabold text-heading">24 Students</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-3.5">
                        <p className="text-[10px] font-bold text-muted uppercase">Attempts Submitted</p>
                        <p className="mt-1 text-xl font-extrabold text-heading">18 / 24</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-3.5">
                        <p className="text-[10px] font-bold text-muted uppercase">Cohort Pass Rate</p>
                        <p className="mt-1 text-xl font-extrabold text-success">88.8%</p>
                      </div>
                    </div>

                    {/* Learner Action Highlights */}
                    <div className="mt-5 space-y-2">
                      <h4 className="text-xs font-bold text-heading uppercase tracking-wider">Learner Follow-Up Classification</h4>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-xs">
                        <span className="font-semibold text-heading">Top Performers (Score ≥ 90%)</span>
                        <span className="rounded bg-success/10 px-2 py-0.5 font-bold text-success">8 Students</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-xs">
                        <span className="font-semibold text-heading">Needs Encouragement (Score &lt; 60%)</span>
                        <span className="rounded bg-warning/10 px-2 py-0.5 font-bold text-warning">2 Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================
                           6. ADMIN / INSTRUCTOR SECTION
           ========================================================= */}
        <section id="for-admins" className="border-t border-border py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                For Administrators & Instructors
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-heading sm:text-4xl tracking-tight">
                Comprehensive Cohort & Assessment Controls
              </h2>
              <p className="mt-4 text-base text-body leading-relaxed">
                Everything instructors need to design quizzes, manage question banks, review student attempts, and track cohort outcomes.
              </p>
            </div>

            {/* Static Admin Product Preview & Capabilities */}
            <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Visual Preview */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-heading">Quiz Workspace</h3>
                        <p className="text-[11px] text-muted">Frontend Development Fundamentals</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-success/10 border border-success/30 px-3 py-1 text-[11px] font-bold text-success">
                      Published
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[10px] font-bold text-muted uppercase">Question Bank</p>
                      <p className="mt-0.5 text-sm font-bold text-heading">15 Questions</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-3">
                      <p className="text-[10px] font-bold text-muted uppercase">Time Limit</p>
                      <p className="mt-0.5 text-sm font-bold text-heading">45 Minutes</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-border pt-4">
                    <span className="rounded bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                      Question Bank
                    </span>
                    <span className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-body">
                      Settings
                    </span>
                    <span className="rounded border border-border bg-background px-2.5 py-1 text-xs font-semibold text-body">
                      Attempt Reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Capabilities List */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-heading">Quiz Management & Publishing</h3>
                    <p className="mt-1 text-xs text-body leading-relaxed">
                      Configure assessment parameters, duration limits, passing scores, and publish quizzes to registered cohorts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-heading">Question Bank Builder</h3>
                    <p className="mt-1 text-xs text-body leading-relaxed">
                      Create and organize assessment repositories supporting multiple-choice, true/false, and open-ended questions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-heading">Attempt Review & Follow-Up</h3>
                    <p className="mt-1 text-xs text-body leading-relaxed">
                      Review completed attempts, inspect answers, and leverage automated student classification to guide follow-up support.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={isAuthenticated ? dashboardRoute : '/login'}
                    className="inline-flex items-center justify-center rounded-button bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-primary-hover"
                  >
                    <span>{isAuthenticated ? `Go to ${dashboardText}` : 'Sign In to Instructor Portal'}</span>
                    <ChevronRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
                           7. CONTACT ADMIN SECTION
           ========================================================= */}
        <section id="contact-admin" className="border-t border-border bg-surface py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center shadow-soft">
              <span className="inline-block rounded-full bg-primary-soft px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Organizational Access
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold text-heading sm:text-3xl tracking-tight">
                Need Access to a Cohort Assessment?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-body">
                Assessments on Taqyem are managed via cohort invitations. Contact your program administrator or instructor to receive your tokenized invitation link.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
                {isAuthenticated ? (
                  <Link
                    to={dashboardRoute}
                    className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover"
                  >
                    Go to {dashboardText}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover"
                    >
                      Sign In to Account
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-button border border-border bg-surface px-6 py-3 text-sm font-semibold text-heading transition-colors hover:bg-background"
                    >
                      Register Learner Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
                           8. FINAL CTA SECTION
           ========================================================= */}
        <section className="border-t border-border py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary-soft/40 p-8 sm:p-14 text-center shadow-soft">
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(340 18% 42% / 0.15), transparent 70%)',
                }}
              />
              <div className="relative z-10 mx-auto max-w-2xl">
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                  Ready to Experience Smart & Fair Assessment?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">
                  Get started with structured cohort assessments, server-authoritative countdowns, and real-time student progress tracking today.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center">
                  {isAuthenticated ? (
                    <Link
                      to={dashboardRoute}
                      className="inline-flex items-center justify-center rounded-button bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <span>Go to {dashboardText}</span>
                      <ChevronRight size={16} className="ml-1.5" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center rounded-button bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <span>Get Started Now</span>
                        <ChevronRight size={16} className="ml-1.5" />
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-button border border-border bg-surface px-7 py-3.5 text-sm font-semibold text-heading transition-colors hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        Sign In to Account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
                         9. PUBLIC FOOTER
         ========================================================= */}
      <footer className="border-t border-border bg-surface/90 text-body transition-colors">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand Column */}
            <div className="space-y-3 sm:col-span-2 md:col-span-1">
              <Link
                to="/"
                className="flex items-center gap-2.5 text-lg font-bold text-heading tracking-tight"
                aria-label="Taqyem Home"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-soft">
                  T
                </span>
                <span className="font-display">Taqyem</span>
              </Link>
              <p className="text-xs leading-relaxed text-muted">
                Smart, Timed & Fair Cohort Learning Assessment Platform.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-heading">Platform</h3>
              <ul className="mt-3.5 space-y-2 text-xs">
                <li>
                  <Link to="/welcome" className="text-muted transition-colors hover:text-heading">
                    Platform Overview
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-muted transition-colors hover:text-heading">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-muted transition-colors hover:text-heading">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#demo" className="text-muted transition-colors hover:text-heading">
                    Demo Preview
                  </a>
                </li>
              </ul>
            </div>

            {/* Administrators */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-heading">Instructors</h3>
              <ul className="mt-3.5 space-y-2 text-xs">
                <li>
                  <a href="#for-admins" className="text-muted transition-colors hover:text-heading">
                    Admin Workspace
                  </a>
                </li>
                <li>
                  <a href="#contact-admin" className="text-muted transition-colors hover:text-heading">
                    Contact Admin
                  </a>
                </li>
                <li>
                  <Link to={isAuthenticated ? dashboardRoute : "/login"} className="text-muted transition-colors hover:text-heading">
                    {isAuthenticated && currentRole === 'ADMIN' ? 'Admin Workspace' : 'Instructor Portal'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account Access */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-heading">Learners</h3>
              <ul className="mt-3.5 space-y-2 text-xs">
                {isAuthenticated ? (
                  <li>
                    <Link to={dashboardRoute} className="text-muted transition-colors hover:text-heading">
                      Go to {dashboardText}
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="text-muted transition-colors hover:text-heading">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-muted transition-colors hover:text-heading">
                        Create Learner Account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Copyright Row */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/80 pt-8 text-xs text-muted sm:flex-row">
            <p>© {new Date().getFullYear()} Taqyem LMS. All rights reserved.</p>
            <p className="text-[11px]">Server-authoritative timed cohort assessments.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
