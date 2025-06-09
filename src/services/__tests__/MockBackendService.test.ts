
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockBackendService from '../MockBackendService';

describe('MockBackendService', () => {
  let service: MockBackendService;

  beforeEach(() => {
    service = MockBackendService.getInstance();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('регистрирует нового пользователя', async () => {
    const userData = {
      user_id: '12345',
      username: 'testuser',
      full_name: 'Test User'
    };

    const result = await service.registerUser(userData);

    expect(result.success).toBe(true);
    expect(result.data?.user_id).toBe('12345');
    expect(result.data?.course_status).toBe('not_started');
  });

  it('проверяет существование пользователя', async () => {
    // Сначала регистрируем пользователя
    await service.registerUser({
      user_id: '12345',
      username: 'testuser',
      full_name: 'Test User'
    });

    // Проверяем что он существует
    const exists = await service.checkUserExists('12345');
    expect(exists).toBe(true);

    // Проверяем несуществующего пользователя
    const notExists = await service.checkUserExists('99999');
    expect(notExists).toBe(false);
  });

  it('обновляет активность пользователя', async () => {
    await service.registerUser({
      user_id: '12345',
      username: 'testuser',
      full_name: 'Test User'
    });

    const result = await service.updateUserActivity('12345');
    expect(result.success).toBe(true);
  });

  it('обрабатывает ошибки при некорректных данных', async () => {
    const result = await service.registerUser({
      user_id: '',
      username: '',
      full_name: ''
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
