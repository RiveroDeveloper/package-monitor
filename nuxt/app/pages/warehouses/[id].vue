<script setup lang="ts">
import type { Warehouse } from '~~/server/api/warehouses.get';

const route = useRoute();
const id = computed(() => String(route.params.id));

const { data: warehouse, error } = await useFetch<Warehouse>(() => `/api/warehouses/${id.value}`);

useHead(() => ({
  title: warehouse.value ? `${warehouse.value.name} — Warehouses` : 'Warehouse not found',
}));
</script>

<template>
  <section>
    <NuxtLink to="/warehouses" class="text-sm text-soft hover:text-primary transition-colors">
      ← All warehouses
    </NuxtLink>

    <div
      v-if="error"
      class="mt-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-5"
    >
      <h2 class="font-black mb-1">Warehouse not found</h2>
      <p class="text-sm">
        No warehouse exists with id <code>{{ id }}</code
        >.
      </p>
    </div>

    <article v-else-if="warehouse" class="mt-3">
      <h1 class="text-3xl font-black tracking-tight text-body">
        {{ warehouse.name }}
      </h1>
      <p class="mt-2 text-soft">{{ warehouse.location }} · Manager: {{ warehouse.managerName }}</p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-panel border border-wire rounded-xl p-5">
          <p class="text-xs font-bold uppercase tracking-wider text-faded mb-1">Capacity</p>
          <p class="text-2xl font-black text-body">
            {{ warehouse.capacity.toLocaleString() }}
          </p>
        </div>
        <div class="bg-panel border border-wire rounded-xl p-5">
          <p class="text-xs font-bold uppercase tracking-wider text-faded mb-1">Current load</p>
          <p class="text-2xl font-black text-body">
            {{ warehouse.currentLoad.toLocaleString() }}
          </p>
        </div>
        <div class="bg-panel border border-wire rounded-xl p-5">
          <p class="text-xs font-bold uppercase tracking-wider text-faded mb-1">Utilization</p>
          <p class="text-2xl font-black text-primary">
            {{ utilization(warehouse.currentLoad, warehouse.capacity) }}%
          </p>
        </div>
      </div>

      <div class="mt-6 bg-panel border border-wire rounded-xl p-5">
        <UtilizationBar
          :current-load="warehouse.currentLoad"
          :capacity="warehouse.capacity"
          show-label
          size="md"
        />
      </div>
    </article>
  </section>
</template>
