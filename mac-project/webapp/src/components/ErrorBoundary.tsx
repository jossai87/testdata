import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Header } from "@cloudscape-design/components";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('ErrorInfo:', errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box padding="l">
          <Header variant="h2">Something went wrong</Header>
          <Box padding={{ vertical: "l" }}>
            {this.state.error?.message}
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;