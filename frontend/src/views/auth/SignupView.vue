<script setup lang="ts">
// External imports
import axios from 'axios';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

// Internal imports
import { useAuthStore } from '@/stores/authstore';

const router = useRouter();
const authStore = useAuthStore();

const name = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const error = ref<string>('');
const submitting = ref<boolean>(false);

async function handleSubmit(): Promise<void> {
  error.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  submitting.value = true;

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    await router.push('/dashboard');
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        const data = err.response.data as { message?: string | string[] };
        const message = Array.isArray(data.message)
          ? data.message.join(' ')
          : data.message;
        error.value =
          message ?? err.response.statusText ?? 'Unable to create account.';
      } else {
        error.value =
          'Unable to connect to the API. Verify that backend is running on http://localhost:3000.';
      }
    } else if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = 'Unable to create account.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas text-body">
    <header class="border-b border-wire bg-canvas/70 backdrop-blur-md">
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
          to="/login"
          class="px-5 py-2 rounded-lg border border-primary/40 text-primary text-sm font-bold hover:bg-primary/10 transition-colors"
        >
          Sign In
        </RouterLink>
      </div>
    </header>

    <main class="min-h-[calc(100vh-82px)] grid lg:grid-cols-2">
      <section
        class="hidden lg:flex flex-col justify-center px-14 py-12 bg-linear-to-br from-canvas via-panel to-canvas border-r border-wire"
      >
        <div class="max-w-xl space-y-8">
          <span
            class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide"
          >
            Create your account
          </span>
          <h2 class="text-5xl font-black tracking-tight leading-tight">
            Build a smarter logistics flow from day one
          </h2>
          <p class="text-soft text-lg leading-relaxed">
            Set up your company workspace, manage package visibility, and
            coordinate warehouses with a unified dashboard.
          </p>
        </div>
      </section>

      <section class="flex items-center justify-center px-6 py-10">
        <div
          class="w-full max-w-md bg-panel border border-wire rounded-2xl p-8 space-y-6"
        >
          <div>
            <h3 class="text-2xl font-black tracking-tight">Create account</h3>
            <p class="text-sm text-faded mt-1">
              Start with a User account and access your dashboard.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <label for="name" class="text-sm font-semibold text-soft">Full Name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                required
                class="w-full bg-sheet border border-wire rounded-xl py-3 px-4 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-semibold text-soft">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="w-full bg-sheet border border-wire rounded-xl py-3 px-4 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="john@company.com"
              />
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="password" class="text-sm font-semibold text-soft">Password</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  minlength="8"
                  class="w-full bg-sheet border border-wire rounded-xl py-3 px-4 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
              <div class="space-y-2">
                <label for="confirmPassword" class="text-sm font-semibold text-soft">Confirm</label>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  required
                  class="w-full bg-sheet border border-wire rounded-xl py-3 px-4 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div
              v-if="error"
              class="flex items-center gap-2 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300"
            >
              <span class="material-symbols-outlined text-base">error</span>
              <p class="text-sm">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="submitting"
              class="w-full py-3 rounded-xl bg-primary text-base font-black hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {{ submitting ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <p class="text-sm text-faded text-center">
            Already have an account?
            <RouterLink
              to="/login"
              class="text-link font-semibold hover:underline"
              >Sign in</RouterLink
            >
          </p>
        </div>
      </section>
    </main>
  </div>
</template>
