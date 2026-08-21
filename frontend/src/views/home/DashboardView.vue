<script setup lang="ts">
// External imports
import type { Chart } from 'chart.js';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

// Internal imports
import StatusBadge from '@/components/shared/StatusBadge.vue';
import { PackageService } from '@/services/PackageService';
import type { PackageInterface } from '@/interfaces/PackageInterface';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';
import { WarehouseService } from '@/services/WarehouseService';
import { buildPieChart } from '@/utils/chartUtils';
import { useAuthStore } from '@/stores/authstore';

const authStore = useAuthStore();
const packages = ref<PackageInterface[]>([]);
const warehouses = ref<WarehouseInterface[]>([]);
const isLoading = ref<boolean>(true);

const recentPackages = computed(() =>
  [...packages.value]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5),
);

const statusColors: Record<string, string> = {
  Delivered: '#10b981',
  'In Transit': '#f59e0b',
  'At Warehouse': '#2dd4bf',
  Pending: '#6b7280',
  Exception: '#f43f5e',
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

function renderChart(): void {
  if (!canvasRef.value) return;
  chartInstance?.destroy();
  const counts: Record<string, number> = {};
  for (const currentPackage of packages.value) {
    counts[currentPackage.status] = (counts[currentPackage.status] ?? 0) + 1;
  }
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = labels.map((label) => statusColors[label] ?? '#8b949e');
  chartInstance = buildPieChart(canvasRef.value, labels, data, colors);
}

onMounted(async () => {
  try {
    const [packagesData, warehousesData] = await Promise.all([
      PackageService.getAll(),
      WarehouseService.getAll(),
    ]);
    packages.value = packagesData;
    warehouses.value = warehousesData;
  } finally {
    isLoading.value = false;
    await nextTick();
    renderChart();
  }
});

onUnmounted(() => {
  chartInstance?.destroy();
  chartInstance = null;
});
</script>

<template>
  <section v-if="!isLoading" class="space-y-8">
    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(stat, i) in [
          {
            icon: 'inventory_2',
            label: 'Total Packages',
            val: packages.length,
            color: 'packages',
          },
          {
            icon: 'warehouse',
            label: 'Warehouses',
            val: warehouses.length,
            color: 'warehouses',
          },
          {
            icon: 'check_circle',
            label: 'Delivered',
            val: packages.filter((currentPackage) => currentPackage.status === 'Delivered').length,
            color: 'primary',
          },
          {
            icon: 'local_shipping',
            label: 'In Transit',
            val: packages.filter((currentPackage) => currentPackage.status === 'In Transit').length,
            color: 'warehouses',
          },
        ]"
        :key="i"
        class="bg-panel p-6 rounded-xl border border-wire"
      >
        <div class="flex justify-between items-start mb-4">
          <div
            class="p-2 rounded-lg"
            :class="{
              'bg-packages/15 text-packages': stat.color === 'packages',
              'bg-warehouses/15 text-warehouses': stat.color === 'warehouses',
              'bg-primary/15 text-primary': stat.color === 'primary',
            }"
          >
            <span class="material-symbols-outlined">{{ stat.icon }}</span>
          </div>
        </div>
        <p class="text-soft text-sm font-medium">{{ stat.label }}</p>
        <h3 class="text-2xl font-bold mt-1 text-body">{{ stat.val }}</h3>
      </div>
    </div>

    <!-- Chart + Recent Packages -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-panel border border-wire rounded-xl p-6">
        <h2 class="font-bold text-lg text-body mb-1">Package Status</h2>
        <p class="text-xs text-faded mb-4">Distribution by current status</p>
        <div class="h-64">
            <canvas ref="canvasRef"></canvas>
        </div>
      </div>

      <div class="bg-panel rounded-xl border border-wire overflow-hidden">
        <div
          class="p-6 border-b border-wire flex justify-between items-center"
        >
          <h2 class="font-bold text-lg text-body">Recent Packages</h2>
          <RouterLink
            to="/packages"
            class="text-link text-sm font-medium hover:underline"
            >View all</RouterLink
          >
        </div>
        <table class="w-full text-left text-sm">
          <thead class="text-faded bg-sheet">
            <tr>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                Tracking #
              </th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                Status
              </th>
              <th class="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">
                Warehouse
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-wire-subtle">
            <tr
              v-for="currentPackage in recentPackages"
              :key="currentPackage.id"
              class="hover:bg-sheet/50 transition-colors"
            >
              <td class="px-6 py-4 font-mono text-packages">
                #{{ currentPackage.id.slice(0, 8) }}
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="currentPackage.status" />
              </td>
              <td class="px-6 py-4 text-soft">
                {{ currentPackage.warehouse?.name ?? 'Unknown Warehouse' }}
              </td>
            </tr>
            <tr v-if="recentPackages.length === 0">
              <td colspan="3" class="px-6 py-6 text-center text-faded">
                No packages yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Warehouse Overview -->
    <div class="bg-panel border border-wire rounded-xl p-6 space-y-4">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold text-body">Warehouses</h2>
          <p class="text-xs text-faded">Capacity overview</p>
        </div>
        <RouterLink
          to="/warehouses"
          class="px-4 py-2 rounded-lg bg-warehouses/10 text-warehouses text-sm font-bold hover:bg-warehouses/20 transition-colors"
        >
          Manage
        </RouterLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RouterLink
          v-for="warehouse in warehouses"
          :key="warehouse.id"
          to="/warehouses"
          class="p-4 bg-sheet rounded-lg border border-wire-subtle hover:border-warehouses/40 transition-colors group"
        >
          <div class="flex items-center justify-between mb-2">
            <h4
              class="text-sm font-bold text-body group-hover:text-warehouses transition-colors"
            >
              {{ warehouse.name }}
            </h4>
          </div>
          <p class="text-faded text-xs flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">location_on</span>
            {{ warehouse.location }}
          </p>
          <div class="mt-3">
            <div class="flex justify-between text-[10px] mb-1">
              <span class="text-soft">Capacity</span>
              <span class="font-bold text-primary"
                >{{ Math.round((warehouse.currentLoad / warehouse.capacity) * 100) }}%</span
              >
            </div>
            <div class="h-1.5 w-full bg-canvas rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="
                  warehouse.currentLoad / warehouse.capacity > 0.9
                    ? 'bg-red-500'
                    : 'bg-primary'
                "
                :style="{
                  width:
                    Math.round((warehouse.currentLoad / warehouse.capacity) * 100) + '%',
                }"
              ></div>
            </div>
          </div>
        </RouterLink>
        <p
          v-if="warehouses.length === 0"
          class="md:col-span-2 lg:col-span-4 text-center text-faded text-sm py-4"
        >
          No warehouses registered yet.
          <RouterLink
            v-if="authStore.isAdmin"
            to="/warehouses"
            class="text-link hover:underline ml-1"
            >Create one</RouterLink
          >
        </p>
      </div>
    </div>
  </section>

  <section v-else class="flex items-center justify-center py-20">
    <p class="text-soft">Loading dashboard...</p>
  </section>
</template>
