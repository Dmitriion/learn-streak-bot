
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import ErrorService, { AppError } from '../services/ErrorService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  private errorService: ErrorService;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.errorService = ErrorService.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = this.errorService.handleError({
      category: 'ui',
      message: 'React Error Boundary перехватил ошибку',
      originalError: error,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      recoverable: true,
    });

    this.setState({ errorId: appError.id });

    if (this.props.onError) {
      this.props.onError(appError);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 flex items-center justify-center">
          <Card className="max-w-md mx-auto border-red-200">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl text-red-800">
                Что-то пошло не так
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
              </p>

              {this.state.errorId && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-xs text-red-600">
                    ID ошибки: {this.state.errorId}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Попробовать снова
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  На главную
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left text-xs text-red-600 bg-red-50 p-3 rounded">
                  <summary>Детали ошибки (dev mode)</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
