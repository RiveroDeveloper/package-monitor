// External imports
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// Internal imports
import { ACCESS_TOKEN_KEY } from '@/utils/axiosInstance';
import { AuthService } from '@/services/AuthService';
import type { RegisterDTO } from '@/dtos/users/RegisterDTO';
import type { UserInterface } from '@/interfaces/UserInterface';

export const useAuthStore = defineStore('auth', () => {
  // When auth is disabled (demo mode), a demo admin user is pre-authenticated
  // so every route is accessible without logging in. Set VITE_AUTH_DISABLED to
  // false (or remove it) to restore the normal login flow.
  const AUTH_DISABLED = (import.meta.env.VITE_AUTH_DISABLED ?? 'false') === 'true';

  const DEMO_USER: UserInterface = {
    id: 'demo-user',
    name: 'Demo Admin',
    email: 'demo@packtrack.local',
    role: 'Admin',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const currentUser = ref<UserInterface | null>(AUTH_DISABLED ? DEMO_USER : null);
  const token = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  const isAuthenticated = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => currentUser.value?.role === 'Admin');

  function syncToken(): void {
    token.value = localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  async function loadCurrentUser(): Promise<UserInterface | null> {
    if (AUTH_DISABLED) {
      currentUser.value = DEMO_USER;
      return currentUser.value;
    }
    syncToken();
    currentUser.value = await AuthService.getCurrentUser();
    return currentUser.value;
  }

  async function login(email: string, password: string): Promise<void> {
    await AuthService.login(email, password);
    syncToken();
    await loadCurrentUser();
  }

  async function register(payload: RegisterDTO): Promise<void> {
    await AuthService.register(payload);
    syncToken();
    await loadCurrentUser();
  }

  function clearSession(): void {
    AuthService.logout();
    currentUser.value = null;
    token.value = null;
  }

  return {
    currentUser,
    token,
    isAuthenticated,
    isAdmin,
    loadCurrentUser,
    login,
    register,
    clearSession,
  };
});
