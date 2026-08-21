<script setup lang="ts">
type Mode = 'SSG' | 'SSR' | 'CSR';

defineProps<{ mode: Mode }>();

const palette: Record<Mode, string> = {
  SSG: 'bg-primary/15 text-primary border-primary/30',
  SSR: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CSR: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};
</script>

<template>
  <span
    class="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
    :class="palette[mode]"
  >
    {{ mode }}
  </span>
</template>
