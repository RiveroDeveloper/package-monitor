<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-canvas text-body">
    <header class="border-b border-wire bg-panel/60 backdrop-blur-md sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div
            class="size-9 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-xl">package_2</span>
          </div>
          <span class="font-black tracking-tight text-body">PackTrack Hybrid</span>
        </NuxtLink>
        <nav>
          <ul class="flex items-center gap-1">
            <li>
              <NuxtLink
                to="/"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-soft hover:text-primary hover:bg-primary/10 transition-colors"
                active-class="!text-primary !bg-primary/15"
              >
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/blog"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-soft hover:text-primary hover:bg-primary/10 transition-colors"
                active-class="!text-primary !bg-primary/15"
              >
                Blog
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/warehouses"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-soft hover:text-primary hover:bg-primary/10 transition-colors"
                active-class="!text-primary !bg-primary/15"
              >
                Warehouses
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/tools"
                class="px-3 py-1.5 rounded-lg text-sm font-medium text-soft hover:text-primary hover:bg-primary/10 transition-colors"
                active-class="!text-primary !bg-primary/15"
              >
                Tools
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-10">
      <NuxtPage />
    </main>
  </div>
</template>
