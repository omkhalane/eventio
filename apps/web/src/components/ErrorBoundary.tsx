import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#fcfcfc',
            padding: '20px',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <h1
            style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}
          >
            ⚠️ Application Error
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '20px',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            There was an error loading the application. Please check the browser console for
            details.
          </p>
          <details
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              maxWidth: '500px',
              color: '#666',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
              Error Details
            </summary>
            <code>{this.state.error?.toString()}</code>
            <code>{'\n\n'}</code>
            <code>{this.state.error?.stack}</code>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
