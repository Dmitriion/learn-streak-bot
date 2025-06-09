import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramProvider } from '../providers/TelegramProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TestSetupOptions, RenderWithProvidersOptions } from './types';

// Импортируем screen, waitFor, fireEvent отдельно
import { screen, waitFor, fireEvent } from '@testing-library/react';

// Создаем новый QueryClient для каждого теста
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
  options?: TestSetupOptions;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children, options = {} }) => {
  const queryClient = createTestQueryClient();

  // Настраиваем mock пользователя если передан
  if (options.user && window.Telegram?.WebApp) {
    window.Telegram.WebApp.initDataUnsafe.user = options.user;
  }

  // Настраиваем тему если передана
  if (options.theme && window.Telegram?.WebApp) {
    window.Telegram.WebApp.colorScheme = options.theme;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options: RenderWithProvidersOptions & RenderOptions = {}
) => {
  const { user, theme, mockN8N, mockTelegram, ...renderOptions } = options;

  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders 
        {...props} 
        options={{ user, theme, mockN8N, mockTelegram }} 
      />
    ),
    ...renderOptions,
  });
};

// Утилита для создания тестового пользователя
export const createTestUser = (overrides = {}) => ({
  id: 12345,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'ru',
  is_premium: false,
  ...overrides
});

// Утилита для ожидания завершения асинхронных операций
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Переэкспортируем всё из testing-library
export { screen, waitFor, fireEvent };
export * from '@testing-library/react';
export { customRender as render };
