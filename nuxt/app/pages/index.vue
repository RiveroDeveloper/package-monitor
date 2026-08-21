<script setup lang="ts">
useHead({ title: 'PackTrack Hybrid — Home' });
</script>

<template>
  <section class="space-y-8">
    <h1 class="text-4xl font-black tracking-tight text-body">PackTrack Hybrid</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <article
        class="bg-panel border border-wire rounded-xl p-6 hover:border-primary/40 transition-colors"
      >
        <RenderModeBadge mode="SSG" class="mb-3" />
        <h2 class="text-lg font-black mb-2">Blog</h2>
        <p class="text-sm text-soft leading-relaxed mb-4">
          Three articles pre-rendered at build time. Each post is a static
          <code class="text-primary text-xs">.html</code> file under
          <code class="text-primary text-xs">/blog/&lt;slug&gt;</code>.
        </p>
        <NuxtLink to="/blog" class="text-sm font-bold text-primary hover:text-primary-dark">
          Read posts →
        </NuxtLink>
      </article>

      <article
        class="bg-panel border border-wire rounded-xl p-6 hover:border-primary/40 transition-colors"
      >
        <RenderModeBadge mode="SSR" class="mb-3" />
        <h2 class="text-lg font-black mb-2">Warehouses</h2>
        <p class="text-sm text-soft leading-relaxed mb-4">
          List rendered on each request. Data fetched from Nuxt's
          <code class="text-primary text-xs">server/</code> layer via
          <code class="text-primary text-xs">useFetch</code>.
        </p>
        <NuxtLink to="/warehouses" class="text-sm font-bold text-primary hover:text-primary-dark">
          Browse warehouses →
        </NuxtLink>
      </article>

      <article
        class="bg-panel border border-wire rounded-xl p-6 hover:border-primary/40 transition-colors"
      >
        <RenderModeBadge mode="CSR" class="mb-3" />
        <h2 class="text-lg font-black mb-2">Tools</h2>
        <p class="text-sm text-soft leading-relaxed mb-4">
          Rendered only in the browser. Includes a capacity calculator and an FAQ accordion.
        </p>
        <NuxtLink to="/tools" class="text-sm font-bold text-primary hover:text-primary-dark">
          Open tools →
        </NuxtLink>
      </article>
    </div>
  </section>
</template>
