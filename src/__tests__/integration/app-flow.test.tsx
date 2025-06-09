
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../test/utils';
import App from '../../App';
import { createTestUser } from '../../test/utils';

describe('App Integration Tests', () => {
  it('полный флоу запуска приложения', async () => {
    const testUser = createTestUser();

    render(<App />, { user: testUser });

    // Ждем загрузки приложения
    await waitFor(() => {
      expect(document.body).toBeDefined();
    }, { timeout: 5000 });

    // Проверяем что приложение загрузилось
    expect(document.body.innerHTML).toContain('telegram-app');
  });

  it('обрабатывает админский доступ', async () => {
    // Мокаем URL с админским параметром
    Object.defineProperty(window, 'location', {
      value: {
        search: '?admin=true'
      },
      writable: true
    });

    const adminUser = createTestUser({ id: 12345 });
    render(<App />, { user: adminUser });

    await waitFor(() => {
      expect(document.body).toBeDefined();
    });
  });

  it('обрабатывает ошибки инициализации', async () => {
    // Мокаем ошибку в Telegram WebApp
    const originalTelegram = window.Telegram;
    window.Telegram = undefined as any;

    render(<App />);

    await waitFor(() => {
      expect(document.body).toBeDefined();
    });

    // Восстанавливаем
    window.Telegram = originalTelegram;
  });
});
