<!-- @author David Hdez, Juan Andrés Young -->
<script setup lang="ts">
// External imports
import axios from 'axios';
import { ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

// Internal imports
import { useAuthStore } from '@/stores/authstore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref<string>('');
const password = ref<string>('');
const error = ref<string>('');
const submitting = ref<boolean>(false);

async function handleSubmit(): Promise<void> {
  submitting.value = true;
  error.value = '';

  try {
    await authStore.login(email.value, password.value);
    const redirect = (route.query.redirect as string) || '/dashboard';
    await router.push(redirect);
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      error.value = 'Invalid email or password.';
    } else if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Unable to sign in. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas text-body">
    <header class="border-b border-wire bg-canvas/80 backdrop-blur-md">
      <div
        class="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between"
      >
        <RouterLink to="/" class="flex items-center gap-2">
          <div
            class="size-10 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-2xl">package_2</span>
          </div>
          <div>
            <h1 class="text-xl font-black tracking-tight">PackTrack</h1>
            <p class="text-[11px] text-faded">Logistics Platform</p>
          </div>
        </RouterLink>

        <RouterLink
          to="/signup"
          class="px-5 py-2 rounded-lg border border-primary/40 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
        >
          Create Account
        </RouterLink>
      </div>
    </header>

    <main class="min-h-[calc(100vh-82px)] grid lg:grid-cols-2">
      <section
        class="hidden lg:flex flex-col justify-center px-14 py-12 bg-canvas border-r border-wire"
      >
        <div class="max-w-xl space-y-8">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide"
          >
            Welcome back
          </span>
          <h2 class="text-5xl font-black tracking-tight leading-tight">
            Sign in and operate your logistics dashboard in real time
          </h2>
          <p class="text-lg text-soft leading-relaxed">
            Track package flow, monitor warehouse capacity, and coordinate your
            team from a single secure workspace.
          </p>
        </div>
      </section>

      <section class="flex items-center justify-center px-6 py-10">
        <div
          class="w-full max-w-md bg-panel border border-wire rounded-2xl p-8 space-y-6"
        >
          <div>
            <h2 class="text-2xl font-black tracking-tight">Sign In</h2>
            <p class="text-sm text-faded mt-1">
              Access your PackTrack dashboard.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label for="email" class="text-sm font-semibold text-soft">Email</label>
              <input
                v-model="email"
                type="email"
                id="email"
                required
                placeholder="user@packtrack.io"
                class="w-full bg-sheet border border-wire rounded-xl py-3 px-4 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div class="space-y-2">
              <label for="password" class="text-sm font-semibold text-soft">Password</label>
              <input
                v-model="password"
                type="password"
                id="password"
                required
                placeholder="Enter your password"
                class="w-full bg-sheet border border-wire rounded-xl py-3 px-4 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div
              v-if="error"
              class="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
            >
              <span class="material-symbols-outlined text-rose-400 text-lg">error</span>
              <p class="text-sm text-rose-300">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full bg-primary text-base font-black py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="text-sm text-faded text-center">
            Need an account?
            <RouterLink
              to="/signup"
              class="text-link font-semibold hover:underline"
              >Sign up</RouterLink
            >
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
