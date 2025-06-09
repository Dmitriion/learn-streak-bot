
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MockBackendService from '../mock/MockBackendService';
import { UserRegistrationData } from '../registration/types';

describe('MockBackendService', () => {
  let service: MockBackendService;

  beforeEach(() => {
    service = MockBackendService.getInstance();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('регистрирует нового пользователя', async () => {
    const userData: UserRegistrationData = {
      user_id: '12345',
      username: 'testuser',
      full_name: 'Test User',
      course_status: 'not_started',
      current_lesson: 0,
      last_activity: new Date().toISOString(),
      score: 0
    };

    const result = await service.registerUser(userData);

    expect(result.success).toBe(true);
    expect(result.message).toContain('Регистрация успешна');
    expect(result.user_exists).toBe(false);
  });

  it('проверяет существование пользователя', async () => {
    // Сначала регистрируем пользователя
    const userData: UserRegistrationData = {
      user_id: '12345',
      username: 'testuser',
      full_name: 'Test User',
      course_status: 'not_started',
      current_lesson: 0,
      last_activity: new Date().toISOString(),
      score: 0
    };
    
    await service.registerUser(userData);

    // Проверяем что он существует
    const existsResult = await service.checkUserExists('12345');
    expect(existsResult.success).toBe(true);
    expect(existsResult.user_exists).toBe(true);

    // Проверяем несуществующего пользователя
    const notExistsResult = await service.checkUserExists('99999');
    expect(notExistsResult.success).toBe(true);
    expect(notExistsResult.user_exists).toBe(false);
  });

  it('обновляет активность пользователя', async () => {
    const userData: UserRegistrationData = {
      user_id: '12345',
      username: 'testuser',
      full_name: 'Test User',
      course_status: 'not_started',
      current_lesson: 0,
      last_activity: new Date().toISOString(),
      score: 0
    };
    
    await service.registerUser(userData);

    // updateUserActivity возвращает void, проверяем что не выбрасывается ошибка
    await expect(service.updateUserActivity('12345')).resolves.toBeUndefined();
  });

  it('обрабатывает ошибки при некорректных данных', async () => {
    const userData: UserRegistrationData = {
      user_id: '',
      username: '',
      full_name: '',
      course_status: 'not_started',
      current_lesson: 0,
      last_activity: new Date().toISOString(),
      score: 0
    };

    const result = await service.registerUser(userData);

    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  });
});
