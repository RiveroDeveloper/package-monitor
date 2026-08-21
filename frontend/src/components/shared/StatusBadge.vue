<!-- @author Samuel Rivero -->
<script setup lang="ts">
defineProps<{
  status: string;
}>();
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
    :class="{
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':
        status === 'Delivered',
      'bg-amber-500/10 text-amber-400 border border-amber-500/20':
        status === 'In Transit',
      'bg-primary/10 text-primary border border-primary/20':
        status === 'At Warehouse',
      'bg-gray-500/10 text-faded border border-gray-500/20':
        status === 'Pending',
      'bg-rose-500/10 text-rose-400 border border-rose-500/20':
        status === 'Exception',
    }"
  >
    {{ status }}
  </span>
</template>
