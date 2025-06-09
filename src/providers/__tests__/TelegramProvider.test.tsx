
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { TelegramProvider, useTelegram } from '../TelegramProvider';
import { createTestUser } from '../../test/utils';

// Компонент для тестирования хука
const TestComponent = () => {
  const { user, isAuthenticated, isRegistered, theme } = useTelegram();
  
  return (
    <div>
      <div data-testid="user-id">{user?.id}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="registered">{isRegistered.toString()}</div>
      <div data-testid="theme">{theme}</div>
    </div>
  );
};

describe('TelegramProvider', () => {
  it('предоставляет данные пользователя из Telegram WebApp', async () => {
    const testUser = createTestUser();
    
    render(
      <TelegramProvider>
        <TestComponent />
      </TelegramProvider>,
      { user: testUser }
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent(testUser.id.toString());
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('обрабатывает отсутствие пользователя', async () => {
    // Убираем пользователя из mock
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.initDataUnsafe.user = undefined;
    }

    render(
      <TelegramProvider>
        <TestComponent />
      </TelegramProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('передает правильную тему', async () => {
    render(
      <TelegramProvider>
        <TestComponent />
      </TelegramProvider>,
      { theme: 'dark' }
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });
});
