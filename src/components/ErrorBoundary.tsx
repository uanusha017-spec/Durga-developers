import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let friendlyMessage =
        'Something went wrong while loading data. Please reload the page and try again.';
      if (this.state.message.includes('Missing or insufficient permissions')) {
        friendlyMessage =
          'Your account does not have permission to perform this database operation. Please sign in with an authorized admin account.';
      } else if (this.state.message.includes('Quota exceeded')) {
        friendlyMessage =
          'Daily Firestore free-tier quota was reached. Quota resets automatically the next day.';
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F8F7] text-[#201D1E] p-6">
          <div className="max-w-lg w-full bg-white border border-[#E3DDDB] rounded-sm p-8 space-y-5">
            <p className="text-xs font-medium text-[#8E2420]">Shri Durga Developers</p>
            <h1 className="font-display text-3xl font-semibold text-[#201D1E]">
              Unable to Complete Request
            </h1>
            <p className="text-sm leading-relaxed text-[#4F4847]">{friendlyMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#8E2420] hover:bg-[#721B18] rounded-sm transition-colors cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
