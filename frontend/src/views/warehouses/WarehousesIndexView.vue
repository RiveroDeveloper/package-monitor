<script setup lang="ts">
// External imports
import axios from 'axios';
import type { Chart } from 'chart.js';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// Internal imports
import { buildBarChart } from '@/utils/chartUtils';
import type { CreateWarehouseDTO } from '@/dtos/warehouses/CreateWarehouseDTO';
import LeafletMap from '@/components/warehouses/LeafletMap.vue';
import type { MapRoute } from '@/components/warehouses/LeafletMap.vue';
import type { UpdateWarehouseDTO } from '@/dtos/warehouses/UpdateWarehouseDTO';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';
import { WarehouseService } from '@/services/WarehouseService';
import { useAuthStore } from '@/stores/authstore';

const authStore = useAuthStore();

const warehouses = ref<WarehouseInterface[]>([]);
const isLoading = ref<boolean>(true);

const successMessage = ref<string>('');
const errorMessage = ref<string>('');

// Create form
const showCreateForm = ref<boolean>(false);
const newName = ref<string>('');
const newLocation = ref<string>('');
const newCapacity = ref<number>(0);
const newCurrentLoad = ref<number>(0);
const newManagerName = ref<string>('');
const newImageUrl = ref<string>('');
const submitting = ref<boolean>(false);

// Inline edit
const editingWarehouseId = ref<string | null>(null);
const editName = ref<string>('');
const editLocation = ref<string>('');
const editCapacity = ref<number>(0);
const editCurrentLoad = ref<number>(0);
const editManagerName = ref<string>('');
const editImageUrl = ref<string>('');

const selectorLocations = computed<string[]>(() =>
  Array.from(new Set(warehouses.value.map((w) => w.location))),
);
const selectedLocation = ref<string>('');

const filteredWarehouses = computed<WarehouseInterface[]>(() =>
  warehouses.value.filter(
    (warehouse) =>
      !selectedLocation.value || warehouse.location === selectedLocation.value,
  ),
);

const CITY_COORDS: Record<string, [number, number]> = {
  'chicago, il': [41.8781, -87.6298],
  'los angeles, ca': [34.0522, -118.2437],
  'newark, nj': [40.7357, -74.1724],
  'atlanta, ga': [33.749, -84.388],
  bogota: [4.711, -74.0721],
  medellin: [6.2442, -75.5812],
};

const warehouseMarkers = computed(() =>
  filteredWarehouses.value
    .map((warehouse) => {
      const coords = CITY_COORDS[warehouse.location.toLowerCase()];
      if (!coords) return null;
      const capacityPercentage = Math.round(
        (warehouse.currentLoad / warehouse.capacity) * 100,
      );
      return {
        id: warehouse.id,
        label: warehouse.name,
        lat: coords[0],
        lng: coords[1],
        popupHtml: `<b>${warehouse.name}</b><br>${warehouse.location}<br>Capacity: ${capacityPercentage}%`,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null),
);

const warehouseRoutes = computed<MapRoute[]>(() => {
  const ids = warehouseMarkers.value.map((m) => m.id);
  if (ids.length < 2) return [];
  return ids.map((id, i) => ({
    fromId: id,
    toId: ids[(i + 1) % ids.length]!,
  }));
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

function renderChart(): void {
  if (!canvasRef.value) return;
  chartInstance?.destroy();
  const labels = warehouses.value.map((warehouse) => warehouse.name);
  const data = warehouses.value.map((warehouse) =>
    Math.round((warehouse.currentLoad / warehouse.capacity) * 100),
  );
  const colors = data.map((p) => (p > 90 ? '#f43f5e' : '#2dd4bf'));
  chartInstance = buildBarChart(canvasRef.value, labels, data, colors);
}

watch(warehouses, async () => {
  await nextTick();
  renderChart();
});

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err) && err.response) {
    const data = err.response.data as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(' ');
    if (data.message) return data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

async function refreshWarehouses(): Promise<void> {
  warehouses.value = await WarehouseService.getAll();
}

function resetCreateForm(): void {
  newName.value = '';
  newLocation.value = '';
  newCapacity.value = 0;
  newCurrentLoad.value = 0;
  newManagerName.value = '';
  newImageUrl.value = '';
}

async function submitCreate(): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';

  const payload: CreateWarehouseDTO = {
    name: newName.value,
    location: newLocation.value,
    capacity: newCapacity.value,
    currentLoad: newCurrentLoad.value,
    managerName: newManagerName.value,
  };
  if (newImageUrl.value) payload.imageUrl = newImageUrl.value;

  submitting.value = true;
  try {
    await WarehouseService.create(payload);
    await refreshWarehouses();
    successMessage.value = 'Warehouse created successfully.';
    resetCreateForm();
    showCreateForm.value = false;
  } catch (err: unknown) {
    errorMessage.value = extractErrorMessage(err, 'Unable to create warehouse.');
  } finally {
    submitting.value = false;
  }
}

function startEdit(warehouse: WarehouseInterface): void {
  editingWarehouseId.value = warehouse.id;
  editName.value = warehouse.name;
  editLocation.value = warehouse.location;
  editCapacity.value = warehouse.capacity;
  editCurrentLoad.value = warehouse.currentLoad;
  editManagerName.value = warehouse.managerName;
  editImageUrl.value = warehouse.imageUrl ?? '';
  errorMessage.value = '';
  successMessage.value = '';
}

function cancelEdit(): void {
  editingWarehouseId.value = null;
}

async function saveEdit(warehouseId: string): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';

  const payload: UpdateWarehouseDTO = {
    name: editName.value,
    location: editLocation.value,
    capacity: editCapacity.value,
    currentLoad: editCurrentLoad.value,
    managerName: editManagerName.value,
  };
  if (editImageUrl.value) payload.imageUrl = editImageUrl.value;

  try {
    await WarehouseService.update(warehouseId, payload);
    await refreshWarehouses();
    successMessage.value = 'Warehouse updated successfully.';
    editingWarehouseId.value = null;
  } catch (err: unknown) {
    errorMessage.value = extractErrorMessage(err, 'Unable to update warehouse.');
  }
}

async function deleteWarehouse(warehouseId: string): Promise<void> {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await WarehouseService.delete(warehouseId);
    await refreshWarehouses();
    successMessage.value = 'Warehouse deleted successfully.';
  } catch (err: unknown) {
    errorMessage.value = extractErrorMessage(err, 'Unable to delete warehouse.');
  }
}

onMounted(async () => {
  try {
    await refreshWarehouses();
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
        <h1 class="text-3xl font-black tracking-tight text-body">Warehouse Hubs</h1>
        <p class="text-soft mt-1">
          Real-time capacity and performance monitoring.
        </p>
      </div>
      <button
        v-if="authStore.isAdmin"
        class="h-10 px-5 bg-primary text-base font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-all w-fit"
        @click="showCreateForm = !showCreateForm"
      >
        <span class="material-symbols-outlined text-sm">{{
          showCreateForm ? 'close' : 'add'
        }}</span>
        {{ showCreateForm ? 'Cancel' : 'New Warehouse' }}
      </button>
    </div>

    <p v-if="successMessage" class="text-emerald-400 text-sm font-medium">
      {{ successMessage }}
    </p>
    <p v-if="errorMessage" class="text-rose-400 text-sm font-medium">
      {{ errorMessage }}
    </p>

    <!-- Create form (Admin only) -->
    <form
      v-if="authStore.isAdmin && showCreateForm"
      class="bg-panel border border-wire rounded-xl p-6 space-y-4"
      @submit.prevent="submitCreate"
    >
      <h3 class="text-lg font-bold text-body">New Warehouse</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Name</label>
          <input
            v-model="newName"
            type="text"
            required
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Hub name"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Location</label>
          <input
            v-model="newLocation"
            type="text"
            required
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="City, Region"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Capacity</label>
          <input
            v-model.number="newCapacity"
            type="number"
            min="0"
            required
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Current Load</label>
          <input
            v-model.number="newCurrentLoad"
            type="number"
            min="0"
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Manager Name</label>
          <input
            v-model="newManagerName"
            type="text"
            required
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Manager"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Image URL (optional)</label>
          <input
            v-model="newImageUrl"
            type="url"
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="https://..."
          />
        </div>
      </div>
      <button
        type="submit"
        :disabled="submitting"
        class="bg-primary text-base font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-primary-dark transition-all disabled:opacity-60"
      >
        {{ submitting ? 'Creating...' : 'Create Warehouse' }}
      </button>
    </form>

    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <select
        v-model="selectedLocation"
        class="select-control bg-panel border border-wire rounded-xl px-4 py-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All Locations</option>
        <option v-for="loc in selectorLocations" :key="loc" :value="loc">
          {{ loc }}
        </option>
      </select>
    </div>

    <div class="bg-panel border border-wire rounded-2xl p-6">
      <h2 class="font-bold text-lg text-body mb-1">Warehouse Locations</h2>
      <p class="text-xs text-faded mb-4">Live route network across all hubs</p>
      <div class="h-80 rounded-xl overflow-hidden">
        <LeafletMap :markers="warehouseMarkers" :routes="warehouseRoutes" />
      </div>
    </div>

    <div class="bg-panel border border-wire rounded-2xl p-6">
      <h2 class="font-bold text-lg text-body mb-1">Capacity Usage</h2>
      <p class="text-xs text-faded mb-4">
        Current load as % of capacity per warehouse
      </p>
      <div class="h-52">
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>

    <div class="bg-panel border border-wire rounded-2xl overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-sheet border-b border-wire">
          <tr class="text-xs font-bold uppercase tracking-wider text-faded">
            <th class="px-6 py-4">Name</th>
            <th class="px-6 py-4">Location</th>
            <th class="px-6 py-4">Manager</th>
            <th class="px-6 py-4">Capacity</th>
            <th class="px-6 py-4">Load</th>
            <th class="px-6 py-4">Usage</th>
            <th v-if="authStore.isAdmin" class="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-wire-subtle">
          <template
            v-for="warehouse in filteredWarehouses"
            :key="warehouse.id"
          >
            <tr class="hover:bg-sheet/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="warehouse.imageUrl"
                    :src="warehouse.imageUrl"
                    :alt="warehouse.name"
                    class="size-10 rounded-lg object-cover bg-warehouses/15"
                  />
                  <span class="text-sm font-bold text-body">{{ warehouse.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-soft">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">location_on</span>
                  {{ warehouse.location }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-soft">
                {{ warehouse.managerName }}
              </td>
              <td class="px-6 py-4 text-sm text-soft">
                {{ warehouse.capacity.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-sm text-soft">
                {{ warehouse.currentLoad.toLocaleString() }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-20 h-2 bg-sheet rounded-full overflow-hidden">
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
                  <span class="text-xs font-bold text-primary"
                    >{{ Math.round((warehouse.currentLoad / warehouse.capacity) * 100) }}%</span
                  >
                </div>
              </td>
              <td v-if="authStore.isAdmin" class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-panel border border-wire text-soft hover:bg-sheet"
                    title="Edit warehouse"
                    @click="startEdit(warehouse)"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    title="Delete warehouse"
                    @click="deleteWarehouse(warehouse.id)"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="editingWarehouseId === warehouse.id">
              <td :colspan="authStore.isAdmin ? 7 : 6" class="px-6 py-0">
                <div class="py-4 space-y-3 border-t border-primary/20">
                  <h4 class="text-sm font-bold text-body">Edit Warehouse</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Name</label>
                      <input
                        v-model="editName"
                        type="text"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Location</label>
                      <input
                        v-model="editLocation"
                        type="text"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Capacity</label>
                      <input
                        v-model.number="editCapacity"
                        type="number"
                        min="0"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Current Load</label>
                      <input
                        v-model.number="editCurrentLoad"
                        type="number"
                        min="0"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Manager Name</label>
                      <input
                        v-model="editManagerName"
                        type="text"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-soft mb-1">Image URL</label>
                      <input
                        v-model="editImageUrl"
                        type="url"
                        class="w-full bg-sheet border border-wire rounded-lg p-2.5 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <button
                      class="bg-primary text-base font-bold py-2 px-5 rounded-lg text-sm hover:bg-primary-dark transition-all"
                      @click="saveEdit(warehouse.id)"
                    >
                      Save
                    </button>
                    <button
                      class="bg-panel border border-wire text-soft font-bold py-2 px-5 rounded-lg text-sm hover:bg-sheet transition-all"
                      @click="cancelEdit"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="filteredWarehouses.length === 0">
            <td
              :colspan="authStore.isAdmin ? 7 : 6"
              class="px-6 py-8 text-center text-faded"
            >
              No warehouses match this filter.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section v-else class="flex items-center justify-center py-20">
    <p class="text-soft">Loading warehouses...</p>
  </section>
</template>
