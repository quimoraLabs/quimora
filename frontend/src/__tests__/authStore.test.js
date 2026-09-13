import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from '../features/auth/store/authStore.js';

describe('Auth Store Unit Tests', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('initializes with default unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });

  it('logout cleans state and clears token', () => {
    useAuthStore.setState({
      user: { name: 'Test User' },
      token: 'fake-token-123',
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
