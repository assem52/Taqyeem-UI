import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Taqyem UI error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-background flex min-h-screen items-center justify-center px-4">
          <div className="border-border bg-surface max-w-md rounded-card border p-8 text-center">
            <h1 className="font-display text-heading text-2xl tracking-tight">
              Something went wrong
            </h1>
            <p className="text-muted mt-2 text-sm leading-relaxed">
              Reload the page to continue. If this keeps happening, contact your instructor.
            </p>
            <button
              type="button"
              className="bg-primary hover:bg-primary-hover mt-6 rounded-button px-4 py-2.5 text-sm font-semibold text-white"
              onClick={() => window.location.assign('/')}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
