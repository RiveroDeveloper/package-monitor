<script setup lang="ts">
// External imports
import { computed, onMounted, ref, watch } from 'vue';

// Internal imports
import type { CreatePackageLogDTO } from '@/dtos/packagelogs/CreatePackageLogDTO';
import { formatDateTime } from '@/utils/formatters';
import type {
  PackageLogInterface,
} from '@/interfaces/PackageLogInterface';
import type { PackageStatus } from '@/interfaces/PackageInterface';
import type { UpdatePackageLogDTO } from '@/dtos/packagelogs/UpdatePackageLogDTO';
import type { WarehouseInterface } from '@/interfaces/WarehouseInterface';
import { PackageLogService } from '@/services/PackageLogService';

const props = defineProps<{
  packageId: string;
  warehouses: WarehouseInterface[];
}>();

const STATUS_OPTIONS: PackageStatus[] = [
  'Pending',
  'In Transit',
  'Delivered',
  'Exception',
  'At Warehouse',
];

const events = ref<PackageLogInterface[]>([]);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string>('');

const canManageRoutes = computed<boolean>(() => props.warehouses.length >= 2);
const defaultFromWarehouseId = computed<string>(
  () => props.warehouses[0]?.id ?? '',
);
const defaultToWarehouseId = computed<string>(
  () => props.warehouses[1]?.id ?? defaultFromWarehouseId.value,
);

const fromWarehouseId = ref<string>('');
const toWarehouseId = ref<string>('');
const newPreviousStatus = ref<PackageStatus | ''>('');
const newNewStatus = ref<PackageStatus | ''>('');
const newDescription = ref<string>('');

const editingEventId = ref<string | null>(null);
const editFromWarehouseId = ref<string>('');
const editToWarehouseId = ref<string>('');
const editPreviousStatus = ref<PackageStatus | ''>('');
const editNewStatus = ref<PackageStatus | ''>('');
const editDescription = ref<string>('');

const isCreateActionDisabled = computed<boolean>(
  () =>
    !canManageRoutes.value || fromWarehouseId.value === toWarehouseId.value,
);
const isEditActionDisabled = computed<boolean>(
  () =>
    !canManageRoutes.value ||
    editFromWarehouseId.value === editToWarehouseId.value,
);

watch(
  () => props.warehouses,
  () => {
    if (!fromWarehouseId.value) fromWarehouseId.value = defaultFromWarehouseId.value;
    if (!toWarehouseId.value) toWarehouseId.value = defaultToWarehouseId.value;
  },
  { immediate: true, deep: true },
);

watch(
  () => props.packageId,
  () => {
    void refreshEvents();
  },
);

async function refreshEvents(): Promise<void> {
  if (!props.packageId) return;
  events.value = await PackageLogService.getByPackageId(
    props.packageId,
  );
}

function getRouteLabel(event: PackageLogInterface): string {
  const from = event.fromWarehouse?.name ?? 'Unknown Warehouse';
  const to = event.toWarehouse?.name ?? 'Unknown Warehouse';
  return `${from} -> ${to}`;
}

function resetCreateForm(): void {
  fromWarehouseId.value = defaultFromWarehouseId.value;
  toWarehouseId.value = defaultToWarehouseId.value;
  newPreviousStatus.value = '';
  newNewStatus.value = '';
  newDescription.value = '';
}

async function addTrackingEvent(): Promise<void> {
  errorMessage.value = '';
  if (!canManageRoutes.value) {
    errorMessage.value =
      'At least two warehouses are required to create a route log.';
    return;
  }

  const payload: CreatePackageLogDTO = {
    packageId: props.packageId,
    fromWarehouseId: fromWarehouseId.value,
    toWarehouseId: toWarehouseId.value,
  };
  if (newPreviousStatus.value) payload.previousStatus = newPreviousStatus.value;
  if (newNewStatus.value) payload.newStatus = newNewStatus.value;
  if (newDescription.value) payload.description = newDescription.value;

  try {
    await PackageLogService.create(payload);
    resetCreateForm();
    await refreshEvents();
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unable to create tracking event.';
  }
}

function startEdit(event: PackageLogInterface): void {
  editingEventId.value = event.id;
  editFromWarehouseId.value = event.fromWarehouse?.id ?? '';
  editToWarehouseId.value = event.toWarehouse?.id ?? '';
  editPreviousStatus.value = event.previousStatus ?? '';
  editNewStatus.value = event.newStatus ?? '';
  editDescription.value = event.description ?? '';
  errorMessage.value = '';
}

function cancelEdit(): void {
  editingEventId.value = null;
}

async function saveEdit(eventId: string): Promise<void> {
  errorMessage.value = '';
  if (!canManageRoutes.value) {
    errorMessage.value =
      'At least two warehouses are required to edit a route log.';
    return;
  }

  const payload: UpdatePackageLogDTO = {
    fromWarehouseId: editFromWarehouseId.value,
    toWarehouseId: editToWarehouseId.value,
  };
  if (editPreviousStatus.value) payload.previousStatus = editPreviousStatus.value;
  if (editNewStatus.value) payload.newStatus = editNewStatus.value;
  if (editDescription.value) payload.description = editDescription.value;

  try {
    await PackageLogService.update(eventId, payload);
    editingEventId.value = null;
    await refreshEvents();
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unable to update tracking event.';
  }
}

async function deleteEvent(eventId: string): Promise<void> {
  errorMessage.value = '';
  try {
    await PackageLogService.delete(eventId);
    if (editingEventId.value === eventId) editingEventId.value = null;
    await refreshEvents();
  } catch (err: unknown) {
    errorMessage.value =
      err instanceof Error ? err.message : 'Unable to delete tracking event.';
  }
}

onMounted(async () => {
  try {
    await refreshEvents();
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-lg font-bold text-body">Tracking Events</h3>

    <div class="bg-sheet rounded-lg border border-wire-subtle p-4 space-y-3">
      <h4 class="text-sm font-bold text-body">Add Warehouse Route Log</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-soft mb-2">From Warehouse</label>
          <select
            v-model="fromWarehouseId"
            class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option
              v-for="warehouse in warehouses"
              :key="warehouse.id"
              :value="warehouse.id"
            >
              {{ warehouse.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-soft mb-2">To Warehouse</label>
          <select
            v-model="toWarehouseId"
            class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option
              v-for="warehouse in warehouses"
              :key="warehouse.id"
              :value="warehouse.id"
            >
              {{ warehouse.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-soft mb-2">Previous Status</label>
          <select
            v-model="newPreviousStatus"
            class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">—</option>
            <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-soft mb-2">New Status</label>
          <select
            v-model="newNewStatus"
            class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">—</option>
            <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-soft mb-2">Description</label>
        <input
          v-model="newDescription"
          type="text"
          class="w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Event details..."
        />
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-xs font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isCreateActionDisabled"
        @click="addTrackingEvent"
      >
        <span class="material-symbols-outlined text-sm">add</span>
        Add Log
      </button>

      <p v-if="!canManageRoutes" class="text-xs text-faded">
        You need at least two warehouses to register route logs.
      </p>
      <p
        v-else-if="fromWarehouseId === toWarehouseId"
        class="text-xs text-faded"
      >
        Select different origin and destination warehouses.
      </p>
    </div>

    <p v-if="errorMessage" class="text-rose-400 text-sm font-medium">
      {{ errorMessage }}
    </p>

    <p v-if="isLoading" class="text-soft text-sm">Loading events...</p>

    <div v-else class="relative pl-6 space-y-6">
      <div class="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/20"></div>
      <div v-for="event in events" :key="event.id" class="relative">
        <div
          class="absolute -left-4 top-1 size-3 rounded-full bg-primary shadow-[0_0_8px_rgba(45,212,191,0.4)]"
        ></div>
        <div class="bg-sheet rounded-lg border border-wire-subtle p-4 ml-2">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="font-medium text-body text-sm">{{ getRouteLabel(event) }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-panel border border-wire text-soft hover:bg-canvas transition-all"
                @click="startEdit(event)"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                Edit
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                @click="deleteEvent(event.id)"
              >
                <span class="material-symbols-outlined text-sm">delete</span>
                Delete
              </button>
            </div>
          </div>

          <div v-if="editingEventId === event.id" class="space-y-3 mb-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-soft mb-2">From Warehouse</label>
                <select
                  v-model="editFromWarehouseId"
                  class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option
                    v-for="warehouse in warehouses"
                    :key="warehouse.id"
                    :value="warehouse.id"
                  >
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-soft mb-2">To Warehouse</label>
                <select
                  v-model="editToWarehouseId"
                  class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option
                    v-for="warehouse in warehouses"
                    :key="warehouse.id"
                    :value="warehouse.id"
                  >
                    {{ warehouse.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-soft mb-2">Previous Status</label>
                <select
                  v-model="editPreviousStatus"
                  class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">—</option>
                  <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-soft mb-2">New Status</label>
                <select
                  v-model="editNewStatus"
                  class="select-control w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">—</option>
                  <option v-for="status in STATUS_OPTIONS" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-soft mb-2">Description</label>
              <input
                v-model="editDescription"
                type="text"
                class="w-full bg-panel border border-wire rounded-lg p-2.5 text-sm text-body placeholder:text-faded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Event details..."
              />
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isEditActionDisabled"
                @click="saveEdit(event.id)"
              >
                Save
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-panel border border-wire text-soft hover:bg-canvas transition-all"
                @click="cancelEdit"
              >
                Cancel
              </button>
            </div>
          </div>

          <div class="space-y-1.5 mt-1">
            <div
              v-if="event.previousStatus || event.newStatus"
              class="flex items-center gap-2 text-xs"
            >
              <span class="text-faded">Status:</span>
              <span v-if="event.previousStatus" class="text-soft">{{ event.previousStatus }}</span>
              <span
                v-if="event.previousStatus && event.newStatus"
                class="material-symbols-outlined text-xs text-faded"
                >arrow_forward</span
              >
              <span v-if="event.newStatus" class="text-primary font-semibold">{{ event.newStatus }}</span>
            </div>
            <p v-if="event.description" class="text-xs text-soft">
              {{ event.description }}
            </p>
            <div class="flex items-center gap-4 text-xs text-faded">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">swap_horiz</span>
                Warehouse transfer
              </span>
              <span v-if="event.timestamp">{{ formatDateTime(event.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="events.length === 0" class="text-faded text-sm py-4 ml-2">
        No tracking events yet.
      </div>
    </div>
  </div>
</template>
