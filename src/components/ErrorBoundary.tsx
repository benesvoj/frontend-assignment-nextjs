'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, Button } from '@heroui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8 gap-4">
              <h2 className="text-2xl font-bold text-danger">Something went wrong</h2>
              <p className="text-gray-600">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                color="primary"
                onPress={this.handleReset}
                className="mt-4"
              >
                Try again
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
