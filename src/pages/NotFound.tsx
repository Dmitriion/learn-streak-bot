
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useTelegramNavigation } from "../hooks/useTelegramNavigation";
import { useTelegram } from "../providers/TelegramProvider";

const NotFound = () => {
  const { currentRoute, navigate } = useTelegramNavigation();
  const { hapticFeedback } = useTelegram();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      currentRoute
    );
  }, [currentRoute]);

  const handleGoHome = () => {
    hapticFeedback('light');
    navigate('dashboard');
  };

  const handleGoBack = () => {
    hapticFeedback('light');
    navigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Страница не найдена
          </h2>
          <p className="text-gray-600">
            К сожалению, запрашиваемая страница не существует
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="h-4 w-4 mr-2" />
            На главную
          </Button>

          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
