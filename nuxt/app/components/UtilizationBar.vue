<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentLoad: number;
    capacity: number;
    showLabel?: boolean;
    size?: 'sm' | 'md';
  }>(),
  { showLabel: false, size: 'sm' },
);

const percent = computed(() => utilization(props.currentLoad, props.capacity));
const color = computed(() => utilizationColor(percent.value));
</script>

<template>
  <div>
    <div v-if="showLabel" class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold uppercase tracking-wider text-faded">Utilization</span>
      <span class="text-xs font-bold text-primary">{{ percent }}%</span>
    </div>
    <div class="bg-canvas rounded-full overflow-hidden" :class="size === 'md' ? 'h-3' : 'h-2'">
      <div
        class="h-full rounded-full transition-all"
        :class="color"
        :style="{ width: percent + '%' }"
      ></div>
    </div>
  </div>
</template>
