<!-- @author David Hdez, Juan Andrés Young, Samuel Rivero -->
<script setup lang="ts">
// External imports
import type { Chart } from 'chart.js';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

// Internal imports
import PackageEvents from '@/components/packages/PackageEvents.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import type {
  PackageInterface,
  PackageStatus,
} from '@/interfaces/PackageInterface';
import { PackageService } from '@/services/PackageService';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';
import { WarehouseService } from '@/services/WarehouseService';
import { buildBarChart } from '@/utils/chartUtils';
import { useAuthStore } from '@/stores/authstore';

const route = useRoute();
const authStore = useAuthStore();

const packages = ref<PackageInterface[]>([]);
const warehouses = ref<WarehouseInterface[]>([]);
const isLoading = ref<boolean>(true);

const visiblePackages = computed<PackageInterface[]>(() => {
  return packages.value;
});

const selectorStatuses = computed<PackageStatus[]>(() => {
  const set = new Set<PackageStatus>();
  for (const currentPackage of visiblePackages.value) set.add(currentPackage.status);
  return Array.from(set);
});

const selectedStatus = ref<PackageStatus | ''>('');
const selectedWarehouseId = ref<string | ''>('');
const expandedPackageId = ref<string | null>(null);

const filteredPackages = computed<PackageInterface[]>(() =>
  visiblePackages.value.filter((currentPackage) => {
    const matchStatus =
      !selectedStatus.value || currentPackage.status === selectedStatus.value;
    const matchWarehouse =
      !selectedWarehouseId.value || currentPackage.warehouse.id === selectedWarehouseId.value;
    return matchStatus && matchWarehouse;
  }),
);

async function refreshPackages(): Promise<void> {
  packages.value = await PackageService.getAll();
}

async function deletePackage(id: string): Promise<void> {
  await PackageService.delete(id);
  await refreshPackages();
}

function toggleHistory(packageId: string): void {
  expandedPackageId.value =
    expandedPackageId.value === packageId ? null : packageId;
}

// chart
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
  for (const currentPackage of visiblePackages.value) {
    counts[currentPackage.status] = (counts[currentPackage.status] ?? 0) + 1;
  }
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = labels.map((l) => statusColors[l] ?? '#8b949e');
  chartInstance = buildBarChart(canvasRef.value, labels, data, colors);
}

watch(visiblePackages, async () => {
  await nextTick();
  renderChart();
});

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
  <section v-if="!isLoading" class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-body">
          Admin Package Management
        </h1>
        <p class="text-soft mt-1">
          Monitor, edit, and remove shipments across the platform.
        </p>
      </div>
      <RouterLink
        :to="{ name: 'packages.create', query: { from: route.fullPath } }"
        class="h-10 px-5 bg-primary font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-all w-fit"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        New Package
      </RouterLink>
    </div>

    <!-- Filters -->
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div class="flex gap-2 overflow-x-auto">
        <button
          class="px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          :class="
            selectedStatus === ''
              ? 'bg-primary'
              : 'bg-panel border border-wire text-soft'
          "
          @click="selectedStatus = ''"
        >
          All
        </button>
        <button
          v-for="status in selectorStatuses"
          :key="status"
          class="px-4 py-2.5 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
          :class="
            selectedStatus === status
              ? 'bg-primary'
              : 'bg-panel border border-wire text-soft'
          "
          @click="selectedStatus = status"
        >
          {{ status }}
        </button>
      </div>

      <select
        v-model="selectedWarehouseId"
        class="select-control bg-panel border border-wire rounded-xl px-4 py-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All Warehouses</option>
        <option
          v-for="warehouse in warehouses"
          :key="warehouse.id"
          :value="warehouse.id"
        >
          {{ warehouse.name }}
        </option>
      </select>
    </div>

    <!-- Chart -->
    <div class="bg-panel border border-wire rounded-2xl p-6">
      <h2 class="font-bold text-lg text-body mb-1">Packages by Status</h2>
      <p class="text-xs text-faded mb-4">Count of packages per status</p>
      <div class="h-52">
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-panel border border-wire rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-sheet border-b border-wire">
          <tr class="text-xs font-bold uppercase tracking-wider text-faded">
            <th class="px-6 py-4">ID</th>
            <th class="px-6 py-4">Description</th>
            <th class="px-6 py-4">Owner</th>
            <th class="px-6 py-4">Warehouse</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4">Logs</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-wire-subtle">
          <template v-for="currentPackage in filteredPackages" :key="currentPackage.id">
            <tr class="hover:bg-sheet/50 transition-colors">
              <td class="px-6 py-4 font-mono text-sm text-packages">
                <RouterLink
                  :to="`/packages/${currentPackage.id}`"
                  class="hover:underline"
                  >#{{ currentPackage.id.slice(0, 8) }}</RouterLink
                >
              </td>
              <td class="px-6 py-4 text-sm font-medium text-body">
                {{ currentPackage.description }}
              </td>
              <td class="px-6 py-4 text-sm text-soft">
                {{ currentPackage.user?.name ?? 'Unknown User' }}
              </td>
              <td class="px-6 py-4 text-sm text-soft">
                {{ currentPackage.warehouse?.name ?? 'Unknown Warehouse' }}
              </td>
              <td class="px-6 py-4">
                <StatusBadge :status="currentPackage.status" />
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                    :class="
                      expandedPackageId === currentPackage.id
                        ? 'bg-primary'
                        : 'bg-packages/10 text-packages border border-packages/20 hover:bg-packages/20'
                    "
                    title="View history"
                    @click="toggleHistory(currentPackage.id)"
                  >
                    <span class="material-symbols-outlined text-sm">history</span>
                  </button>
                  <RouterLink
                    :to="{ name: 'packages.show', params: { id: currentPackage.id }, query: { edit: '1' } }"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-packages/10 text-packages border border-packages/20 hover:bg-packages/20"
                    title="Edit package"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </RouterLink>
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    title="Delete package"
                    @click="deletePackage(currentPackage.id)"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="expandedPackageId === currentPackage.id">
              <td colspan="6" class="px-6 py-0">
                <div class="py-4 border-t border-primary/20">
                  <PackageEvents :package-id="currentPackage.id" :warehouses="warehouses" />
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="filteredPackages.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-faded">
              No packages match these filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section v-else class="flex items-center justify-center py-20">
    <p class="text-soft">Loading packages...</p>
  </section>
</template>
