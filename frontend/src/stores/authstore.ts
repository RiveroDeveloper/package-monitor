/** @author David Hdez, Juan Andrés Young */
// External imports
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// Internal imports
import { ACCESS_TOKEN_KEY } from '@/utils/axiosInstance';
import { AuthService } from '@/services/AuthService';
import type { RegisterDTO } from '@/dtos/users/RegisterDTO';
import type { UserInterface } from '@/interfaces/UserInterface';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserInterface | null>(null);
  const token = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  const isAuthenticated = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => currentUser.value?.role === 'Admin');

  function syncToken(): void {
    token.value = localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  async function loadCurrentUser(): Promise<UserInterface | null> {
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
