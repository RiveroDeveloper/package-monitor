<script setup lang="ts">
// External imports
import { computed, onMounted } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';

// Internal imports
import { useAuthStore } from '@/stores/authstore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const showAuthenticatedLayout = computed(
  () => Boolean(route.meta.requiresAuth) && authStore.isAuthenticated,
);

onMounted(async () => {
  await authStore.loadCurrentUser();
});

function isRouteGroupActive(groupName: string): boolean {
  const currentRouteName = route.name;

  if (typeof currentRouteName !== 'string') {
    return false;
  }

  return (
    currentRouteName === groupName ||
    currentRouteName.startsWith(`${groupName}.`)
  );
}

async function handleLogout(): Promise<void> {
  authStore.clearSession();
  await router.push({ name: 'login' });
}
</script>

<template>
  <div class="bg-canvas text-body min-h-screen font-[Inter]">
    <!-- Authenticated layout -->
    <div
      v-if="showAuthenticatedLayout"
      class="flex h-screen overflow-hidden"
      :class="{ 'admin-mode': authStore.isAdmin }"
    >
      <!-- sidebar -->
      <aside
        class="w-64 shrink-0 border-r hidden md:flex flex-col h-screen sticky top-0 transition-colors"
        :class="
          authStore.isAdmin
            ? 'border-amber-500/30 bg-gradient-to-b from-amber-500/[0.06] to-panel'
            : 'border-wire bg-panel'
        "
      >
        <div class="p-6 flex items-center">
          <RouterLink to="/dashboard" class="flex items-center gap-2">
            <div
              class="size-10 rounded-lg flex items-center justify-center transition-colors"
              :class="
                authStore.isAdmin
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-primary/15 border border-primary/25 text-primary'
              "
            >
              <span class="material-symbols-outlined text-2xl leading-6 block">
                {{ authStore.isAdmin ? 'shield_person' : 'package_2' }}
              </span>
            </div>
            <div class="flex flex-col leading-none">
              <h1 class="text-lg font-black tracking-tight text-body">PackTrack</h1>
              <p class="text-faded text-[11px] font-medium mt-1">Logistics v1.0.0</p>
            </div>
          </RouterLink>
        </div>

        <!-- Admin Mode banner — only visible for admins -->
        <div v-if="authStore.isAdmin" class="px-4 mb-2">
          <div
            class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
          >
            <span class="material-symbols-outlined text-amber-400 text-sm leading-none">
              admin_panel_settings
            </span>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
              Admin Mode
            </span>
          </div>
        </div>

        <nav class="flex-1 px-4 space-y-1 mt-2">
          <RouterLink
            to="/dashboard"
            class="flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors"
            :class="
              isRouteGroupActive('dashboard')
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'text-soft border-transparent hover:bg-primary/10 hover:text-primary'
            "
          >
            <span class="material-symbols-outlined">dashboard</span>
            <span class="text-sm font-medium">Overview</span>
          </RouterLink>

          <RouterLink
            to="/packages"
            class="flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors"
            :class="
              isRouteGroupActive('packages')
                ? 'bg-packages/15 text-packages border-packages/30'
                : 'text-soft border-transparent hover:bg-packages/10 hover:text-packages'
            "
          >
            <span class="material-symbols-outlined">inventory_2</span>
            <span class="text-sm font-medium">Packages</span>
          </RouterLink>

          <RouterLink
            to="/warehouses"
            class="flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors"
            :class="
              isRouteGroupActive('warehouses')
                ? 'bg-warehouses/15 text-warehouses border-warehouses/30'
                : 'text-soft border-transparent hover:bg-warehouses/10 hover:text-warehouses'
            "
          >
            <span class="material-symbols-outlined">warehouse</span>
            <span class="text-sm font-medium">Warehouses</span>
          </RouterLink>

          <!-- Admin-only section divider -->
          <div v-if="authStore.isAdmin" class="pt-4 pb-1 px-3 flex items-center gap-2">
            <span class="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400/80">
              Admin Tools
            </span>
            <div class="flex-1 h-px bg-amber-500/20"></div>
          </div>

          <RouterLink
            v-if="authStore.isAdmin"
            to="/users"
            class="flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors"
            :class="
              isRouteGroupActive('users')
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                : 'text-soft border-transparent hover:bg-amber-500/10 hover:text-amber-400'
            "
          >
            <span class="material-symbols-outlined">group</span>
            <span class="text-sm font-medium">Users</span>
          </RouterLink>
        </nav>

        <!-- User card at the bottom -->
        <div
          class="p-4 border-t"
          :class="authStore.isAdmin ? 'border-amber-500/20' : 'border-wire'"
        >
          <div
            class="flex items-center gap-3 p-2 rounded-xl"
            :class="authStore.isAdmin ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-sheet'"
          >
            <div
              class="size-8 rounded-full flex items-center justify-center"
              :class="
                authStore.isAdmin
                  ? 'bg-amber-500/30 text-amber-400'
                  : 'bg-primary/30 text-primary'
              "
            >
              <span class="material-symbols-outlined text-sm">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <p class="text-xs font-bold truncate text-body">
                  {{ authStore.currentUser?.name }}
                </p>
                <span
                  class="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none"
                  :class="
                    authStore.isAdmin
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-primary/15 text-primary border border-primary/25'
                  "
                >
                  {{ authStore.currentUser?.role }}
                </span>
              </div>
              <p class="text-[10px] text-faded truncate">
                {{ authStore.currentUser?.email }}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <!-- main content area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- top header -->
        <header
          class="h-16 flex items-center justify-between px-8 border-b sticky top-0 backdrop-blur-md z-10 transition-colors"
          :class="
            authStore.isAdmin
              ? 'border-amber-500/30 bg-amber-500/[0.04]'
              : 'border-wire bg-canvas/80'
          "
        >
          <div class="flex items-center gap-3 flex-1">
            <h2 class="text-lg font-bold tracking-tight text-body">
              {{ $route.meta.title }}
            </h2>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border leading-none"
              :class="
                authStore.isAdmin
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                  : 'bg-primary/10 text-primary border-primary/30'
              "
            >
              <span class="material-symbols-outlined align-middle text-[12px] mr-0.5 leading-none">
                {{ authStore.isAdmin ? 'shield_person' : 'person' }}
              </span>
              {{ authStore.currentUser?.role }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="size-10 flex items-center justify-center rounded-lg bg-sheet text-soft hover:text-rose-400 transition-colors"
              @click="handleLogout"
            >
              <span class="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        <!-- main content -->
        <main class="flex-1 overflow-y-auto p-8">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- Guest layout (Login) -->
    <div v-else>
      <RouterView />
    </div>
  </div>
</template>
