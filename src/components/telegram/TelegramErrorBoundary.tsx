
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class TelegramErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Отправляем ошибку в Telegram если доступно
    if (window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.showAlert(`Произошла ошибка: ${error.message}`);
      } catch (e) {
        console.error('Не удалось показать alert в Telegram:', e);
      }
    }

    // Логируем ошибку
    console.error('TelegramErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800">Произошла ошибка</CardTitle>
              <CardDescription>
                Приложение столкнулось с неожиданной ошибкой
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleReset} 
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать еще раз
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                >
                  Перезагрузить приложение
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Если проблема повторяется, обратитесь к администратору
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TelegramErrorBoundary;
