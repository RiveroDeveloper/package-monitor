<script setup lang="ts">
// External imports
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

const route = useRoute();
const router = useRouter();
const packageId = String(route.params.id);

const currentPackage = ref<PackageInterface | null>(null);
const warehouses = ref<WarehouseInterface[]>([]);
const isLoading = ref<boolean>(true);
const editMode = ref<boolean>(false);
const editStatus = ref<PackageStatus>('Pending');
const editDescription = ref<string>('');
const editWarehouseId = ref<string>('');
const errorMessage = ref<string>('');

const STATUS_OPTIONS: PackageStatus[] = [
  'Pending',
  'In Transit',
  'Delivered',
  'Exception',
  'At Warehouse',
];

async function refreshPackage(): Promise<void> {
  currentPackage.value = await PackageService.getById(packageId);
}

function startEdit(): void {
  if (!currentPackage.value) return;
  editStatus.value = currentPackage.value.status;
  editDescription.value = currentPackage.value.description;
  editWarehouseId.value = currentPackage.value.warehouse.id;
  editMode.value = true;
  errorMessage.value = '';
}

async function saveEdit(): Promise<void> {
  errorMessage.value = '';
  try {
    await PackageService.update(packageId, {
      status: editStatus.value,
      description: editDescription.value,
      warehouseId: editWarehouseId.value,
    });
    await refreshPackage();
    editMode.value = false;
    // remove edit query param from URL after saving
    const newQuery = { ...route.query } as Record<string, any>;
    delete newQuery.edit;
    await router.replace({ name: 'packages.show', params: { id: packageId }, query: newQuery });
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unable to update package.';
  }
}

function closeEdit(): void {
  editMode.value = false;
  const newQuery = { ...route.query } as Record<string, any>;
  delete newQuery.edit;
  void router.replace({ name: 'packages.show', params: { id: packageId }, query: newQuery });
}

async function deletePackage(): Promise<void> {
  await PackageService.delete(packageId);
  await router.push('/packages');
}

onMounted(async () => {
  try {
    const [loaded, whs] = await Promise.all([
      PackageService.getById(packageId),
      WarehouseService.getAll(),
    ]);
    currentPackage.value = loaded;
    warehouses.value = whs;
    // If URL has ?edit (from index/admin lists), open edit mode automatically
    if (route.query.edit) startEdit();
  } catch {
    currentPackage.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section v-if="isLoading" class="flex items-center justify-center py-20">
    <p class="text-soft">Loading package...</p>
  </section>

  <section v-else-if="currentPackage" class="space-y-8">
    <div class="bg-panel rounded-xl border border-wire p-8">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h2 class="text-2xl font-black text-body">{{ currentPackage.description }}</h2>
        </div>
        <div class="flex items-center gap-3">
          <StatusBadge :status="currentPackage.status" class="text-sm px-4 py-2" />
          <button
            class="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-panel border border-wire text-soft hover:bg-sheet transition-all"
            @click="startEdit"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button
            class="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            @click="deletePackage"
          >
            <span class="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="editMode"
      class="bg-panel rounded-xl border border-wire p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-body">Edit Package</h3>
        <button
          @click="closeEdit"
          class="inline-flex items-center gap-1 p-2 rounded hover:bg-sheet"
          title="Close edit"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Status</label>
          <select
            v-model="editStatus"
            class="select-control w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Description</label>
          <input
            v-model="editDescription"
            type="text"
            class="w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold text-soft mb-2">Warehouse</label>
          <select
            v-model="editWarehouseId"
            class="select-control w-full bg-sheet border border-wire rounded-lg p-3 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option v-for="wh in warehouses" :key="wh.id" :value="wh.id">
              {{ wh.name }}
            </option>
          </select>
        </div>
      </div>
      <p v-if="errorMessage" class="text-rose-400 text-sm">{{ errorMessage }}</p>
      <div class="flex gap-3">
        <button
          class="bg-primary font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-primary-dark transition-all"
          @click="saveEdit"
        >
          Save
        </button>
        <button
          class="bg-panel border border-wire text-soft font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-sheet transition-all"
          @click="editMode = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <div class="bg-panel rounded-xl border border-wire p-6">
      <h3 class="text-lg font-bold text-body mb-4">Package Information</h3>
      <div class="space-y-3">
        <div class="flex justify-between border-b border-wire-subtle pb-3">
          <span class="text-soft">Owner</span>
          <span class="font-medium text-body">{{ currentPackage.user?.name ?? 'Unknown User' }}</span>
        </div>
        <div class="flex justify-between border-b border-wire-subtle pb-3">
          <span class="text-soft">Description</span>
          <span class="font-medium text-body">{{ currentPackage.description }}</span>
        </div>
        <div class="flex justify-between border-b border-wire-subtle pb-3">
          <span class="text-soft">Warehouse</span>
          <span class="font-medium text-body">{{ currentPackage.warehouse?.name ?? 'Unknown Warehouse' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-soft">Status</span>
          <span class="font-medium text-body">{{ currentPackage.status }}</span>
        </div>
      </div>
    </div>

    <div class="bg-panel rounded-xl border border-wire p-6">
      <PackageEvents :package-id="currentPackage.id" :warehouses="warehouses" />
    </div>
  </section>

  <section v-else class="flex flex-col items-center justify-center py-20">
    <span class="material-symbols-outlined text-6xl text-faded mb-4"
      >search_off</span
    >
    <h2 class="text-xl font-bold text-soft">Package not found</h2>
    <p class="text-faded mt-2">
      The package you're looking for doesn't exist.
    </p>
  </section>
</template>
