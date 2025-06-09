
import { describe, it, expect } from 'vitest';

describe('Bundle Performance', () => {
  it('проверяет что основные модули загружаются быстро', async () => {
    const startTime = performance.now();
    
    // Динамический импорт основных модулей
    await import('../../providers/TelegramProvider');
    await import('../../TelegramApp');
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Проверяем что загрузка происходит быстро (< 100ms в тестах)
    expect(loadTime).toBeLessThan(100);
  });

  it('проверяет ленивую загрузку тяжелых компонентов', async () => {
    const startTime = performance.now();
    
    // Эти компоненты должны загружаться быстро
    await import('../../pages/Dashboard');
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(50);
  });
});
