import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px;
  border: 1px solid #ef5350;
  border-radius: 8px;
  background-color: rgba(239, 83, 80, 0.1);
  color: #f0f0f0;
`;

const ErrorHeader = styled.h2`
  color: #ef5350;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  margin-bottom: 10px;
`;

const ErrorStack = styled.pre`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
  color: #aaa;
`;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorContainer>
          <ErrorHeader>Something went wrong</ErrorHeader>
          <ErrorMessage>{this.state.error?.message || 'An unknown error occurred'}</ErrorMessage>
          {this.state.error && (
            <ErrorStack>{this.state.error.stack}</ErrorStack>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
