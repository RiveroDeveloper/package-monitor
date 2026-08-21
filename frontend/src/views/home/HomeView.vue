<script setup lang="ts">
// External imports
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

// Internal imports
import { useAuthStore } from '@/stores/authstore';

const authStore = useAuthStore();

const primaryActionLabel = computed(() =>
  authStore.isAuthenticated ? 'Open Dashboard' : 'Get Started',
);
const primaryActionPath = computed(() =>
  authStore.isAuthenticated ? '/dashboard' : '/signup',
);
const secondaryActionPath = computed(() =>
  authStore.isAuthenticated ? '/packages' : '/login',
);
const secondaryActionLabel = computed(() =>
  authStore.isAuthenticated ? 'Track Packages' : 'Sign In',
);
</script>

<template>
  <div class="min-h-screen bg-canvas text-body">
    <header
      class="sticky top-0 z-40 border-b border-wire bg-canvas/80 backdrop-blur-md"
    >
      <div
        class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"
      >
        <RouterLink to="/" class="flex items-center gap-3">
          <div
            class="size-10 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-2xl">package_2</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">PackTrack</h1>
        </RouterLink>

        <nav class="hidden md:flex items-center gap-8">
          <RouterLink
            to="/"
            class="text-sm font-semibold text-soft hover:text-primary transition-colors"
            >Home</RouterLink
          >
          <RouterLink
            to="/dashboard"
            class="text-sm font-semibold text-soft hover:text-primary transition-colors"
            >Dashboard</RouterLink
          >
          <RouterLink
            v-if="!authStore.isAuthenticated"
            to="/login"
            class="text-sm font-semibold text-soft hover:text-primary transition-colors"
            >Sign In</RouterLink
          >
        </nav>

        <RouterLink
          :to="primaryActionPath"
          class="px-6 py-2.5 rounded-xl bg-primary text-base font-black text-sm hover:bg-primary-dark transition-colors"
        >
          {{ primaryActionLabel }}
        </RouterLink>
      </div>
    </header>

    <main>
      <section
        class="relative py-20 lg:py-28 overflow-hidden border-b border-wire"
      >
        <div
          class="absolute -top-36 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-[80px]"
        ></div>
        <div
          class="absolute -bottom-44 -left-20 w-96 h-96 rounded-full bg-cta/10 blur-[100px]"
        ></div>

        <div
          class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center relative"
        >
          <div class="space-y-8">
            <span
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wide"
            >
              Next logistics platform
            </span>

            <h2
              class="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight max-w-xl"
            >
              Track every shipment with live warehouse intelligence
            </h2>

            <p class="text-lg text-soft max-w-xl leading-relaxed">
              Keep your operations in sync with package monitoring, warehouse
              utilization insights, and role-based workflows in one command
              center.
            </p>

            <div class="flex flex-wrap gap-4">
              <RouterLink
                :to="primaryActionPath"
                class="px-8 py-4 rounded-xl bg-cta text-base font-black hover:bg-cta-hover transition-colors"
              >
                {{ primaryActionLabel }}
              </RouterLink>
              <RouterLink
                :to="secondaryActionPath"
                class="px-8 py-4 rounded-xl border border-wire bg-panel text-body font-black hover:border-primary/50 hover:text-primary transition-colors"
              >
                {{ secondaryActionLabel }}
              </RouterLink>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="py-10 border-t border-wire">
      <div
        class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-between"
      >
        <p class="text-sm text-faded">
          © 2026 PackTrack Systems. All rights reserved.
        </p>
        <div class="flex gap-5 text-sm text-soft">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  </div>
</template>
