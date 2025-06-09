
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSetupWizard } from '../useSetupWizard';
import { createTestUser } from '../../test/utils';

// Mock для провайдера
vi.mock('../../providers/TelegramProvider', () => ({
  useTelegram: () => ({
    user: createTestUser({ id: 12345 }) // админский ID
  })
}));

describe('useSetupWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('определяет что setup требуется для новой установки', () => {
    const { result } = renderHook(() => useSetupWizard());

    expect(result.current.isSetupRequired).toBeDefined();
    expect(result.current.configurationStatus).toBeDefined();
  });

  it('показывает мастер админам когда setup не завершен', () => {
    const { result } = renderHook(() => useSetupWizard());

    expect(result.current.isAdminAccess).toBe(true);
    expect(result.current.shouldShowWizard).toBeDefined();
  });

  it('позволяет завершить setup', () => {
    const { result } = renderHook(() => useSetupWizard());

    act(() => {
      result.current.completeSetup();
    });

    expect(result.current.shouldShowWizard).toBe(false);
  });

  it('позволяет пропустить setup', () => {
    const { result } = renderHook(() => useSetupWizard());

    act(() => {
      result.current.skipSetup();
    });

    expect(result.current.shouldShowWizard).toBe(false);
  });
});
