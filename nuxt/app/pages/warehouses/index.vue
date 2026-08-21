<script setup lang="ts">
import type { Warehouse } from '~~/server/api/warehouses.get';

useHead({ title: 'Warehouses — PackTrack Hybrid' });

const { data: warehouses, error } = await useFetch<Warehouse[]>('/api/warehouses');
</script>

<template>
  <section>
    <div class="mb-8">
      <RenderModeBadge mode="SSR" class="mb-3" />
      <h1 class="text-3xl font-black tracking-tight text-body">Warehouses</h1>
      <p class="mt-2 text-soft">
        Rendered server-side on each request. Data fetched from
        <code class="text-primary">/api/warehouses</code> served by Nuxt's
        <code class="text-primary">server/</code> layer.
      </p>
    </div>

    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-sm"
    >
      Could not load warehouses.
    </div>

    <div v-else-if="warehouses" class="bg-panel border border-wire rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-sheet border-b border-wire">
          <tr class="text-xs font-bold uppercase tracking-wider text-faded">
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Location</th>
            <th class="px-6 py-3 text-right">Capacity</th>
            <th class="px-6 py-3 text-right">Load</th>
            <th class="px-6 py-3">Utilization</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-wire-subtle">
          <tr
            v-for="warehouse in warehouses"
            :key="warehouse.id"
            class="hover:bg-sheet/50 transition-colors"
          >
            <td class="px-6 py-4">
              <NuxtLink
                :to="`/warehouses/${warehouse.id}`"
                class="font-bold text-body hover:text-primary transition-colors"
              >
                {{ warehouse.name }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 text-sm text-soft">{{ warehouse.location }}</td>
            <td class="px-6 py-4 text-sm text-soft text-right">
              {{ warehouse.capacity.toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-sm text-soft text-right">
              {{ warehouse.currentLoad.toLocaleString() }}
            </td>
            <td class="px-6 py-4 min-w-[180px]">
              <div class="flex items-center gap-3">
                <UtilizationBar
                  class="flex-1"
                  :current-load="warehouse.currentLoad"
                  :capacity="warehouse.capacity"
                />
                <span class="text-xs font-bold text-primary w-10 text-right">
                  {{ utilization(warehouse.currentLoad, warehouse.capacity) }}%
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
