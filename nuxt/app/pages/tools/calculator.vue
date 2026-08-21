<script setup lang="ts">
useHead({ title: 'Capacity calculator — Tools' });

const currentLoad = ref<number>(0);
const capacity = ref<number>(1000);

const percent = computed(() => utilization(currentLoad.value, capacity.value));

const advice = computed(() => {
  if (percent.value === 0) return 'Enter values to compute utilization.';
  if (percent.value > 90) return 'Critical: redirect inbound shipments to alternate hubs.';
  if (percent.value > 70) return 'Healthy: monitor closely for capacity spikes.';
  return 'Under-utilized: consider consolidating with another hub.';
});
</script>

<template>
  <section class="max-w-2xl">
    <NuxtLink to="/tools" class="text-sm text-soft hover:text-primary transition-colors">
      ← Tools
    </NuxtLink>
    <h1 class="mt-3 text-3xl font-black tracking-tight text-body">Capacity calculator</h1>
    <p class="mt-2 text-soft">
      Type the current load and total capacity of a warehouse to see its utilization.
    </p>

    <div class="mt-6 bg-panel border border-wire rounded-xl p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="currentLoad" class="block text-sm font-semibold text-soft mb-2">
            Current load
          </label>
          <input
            id="currentLoad"
            v-model.number="currentLoad"
            type="number"
            min="0"
            placeholder="0"
            class="w-full bg-sheet border border-wire rounded-lg px-3 py-2.5 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label for="capacity" class="block text-sm font-semibold text-soft mb-2">
            Total capacity
          </label>
          <input
            id="capacity"
            v-model.number="capacity"
            type="number"
            min="1"
            placeholder="1000"
            class="w-full bg-sheet border border-wire rounded-lg px-3 py-2.5 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <UtilizationBar :current-load="currentLoad" :capacity="capacity" show-label size="md" />
        <p class="mt-3 text-sm text-soft">{{ advice }}</p>
      </div>
    </div>
  </section>
</template>
