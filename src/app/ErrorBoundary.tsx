import { Component } from 'react';
import type { ReactNode } from 'react';
import { ErrorState } from '../shared/components/ErrorState';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="error-fallback">
          <h1>Coś poszło nie tak</h1>
          <ErrorState onRetry={() => this.setState({ hasError: false })} />
        </div>
      );
    return this.props.children;
  }
}
