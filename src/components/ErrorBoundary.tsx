import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Catches unhandled render errors anywhere in the
 * component tree and shows a recovery UI instead of a blank white screen.
 *
 * Must be a class component — React's error boundary API (getDerivedStateFromError
 * / componentDidCatch) is not available to function components.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const isDev = import.meta.env.DEV;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <img
            src="/assets/animated_digimon/Agumon/sad1.png"
            alt="Sad Agumon"
            className="w-24 h-24 mx-auto mb-6"
            style={{ imageRendering: 'pixelated' }}
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            An unexpected error occurred. Your data is safe — reloading the page should fix this.
          </p>

          {isDev && (
            <pre className="text-left text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 overflow-auto max-h-48">
              {this.state.error.message}
            </pre>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
