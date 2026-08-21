<script setup lang="ts">
useHead({ title: 'Tools — PackTrack Hybrid' });
</script>

<template>
  <section>
    <div class="mb-8">
      <RenderModeBadge mode="CSR" class="mb-3" />
      <h1 class="text-3xl font-black tracking-tight text-body">Tools</h1>
      <p class="mt-2 text-soft">
        Rendered only in the browser. The initial HTML is just an empty shell; everything below
        renders after JavaScript loads.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtLink
        to="/tools/calculator"
        class="bg-panel border border-wire rounded-xl p-6 hover:border-primary/40 transition-colors block"
      >
        <h2 class="text-lg font-black mb-2 text-body">Capacity calculator</h2>
        <p class="text-sm text-soft leading-relaxed mb-3">
          Compute warehouse-utilization percentage with a colored progress bar.
        </p>
        <span class="text-sm font-bold text-primary">Open calculator →</span>
      </NuxtLink>

      <NuxtLink
        to="/tools/faq"
        class="bg-panel border border-wire rounded-xl p-6 hover:border-primary/40 transition-colors block"
      >
        <h2 class="text-lg font-black mb-2 text-body">FAQ</h2>
        <p class="text-sm text-soft leading-relaxed mb-3">
          Common questions about how PackTrack tracks packages and warehouses.
        </p>
        <span class="text-sm font-bold text-primary">Read FAQ →</span>
      </NuxtLink>
    </div>
  </section>
</template>
