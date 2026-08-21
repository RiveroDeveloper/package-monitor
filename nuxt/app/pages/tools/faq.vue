<script setup lang="ts">
useHead({ title: 'FAQ — Tools' });

const faqs = [
  {
    id: 'what-is',
    question: 'What is PackTrack?',
    answer:
      'PackTrack is a logistics dashboard that tracks every package through its lifecycle across multiple warehouses, with role-based access for admins and regular users.',
  },
  {
    id: 'tracking',
    question: 'How are packages tracked across warehouses?',
    answer:
      'Each package has a unique UUID and a log of warehouse-to-warehouse transfers. Every move appends a PackageLog row that records previous status, new status, origin, and destination.',
  },
  {
    id: 'roles',
    question: 'What is the difference between Admin and User?',
    answer:
      'Users can create and view their own packages. Admins additionally manage warehouses, promote other users, and see every package across the platform.',
  },
  {
    id: 'rendering',
    question: 'Why does this site mix SSR and CSR?',
    answer:
      'Different routes have different needs. Warehouse data may change, so it is fetched server-side per request (SSR). The interactive tools only matter once the user is on the page, so they are rendered client-side (CSR).',
  },
];

const openId = ref<string | null>(faqs[0]?.id ?? null);

function toggle(id: string): void {
  openId.value = openId.value === id ? null : id;
}
</script>

<template>
  <section class="max-w-3xl">
    <NuxtLink to="/tools" class="text-sm text-soft hover:text-primary transition-colors">
      ← Tools
    </NuxtLink>
    <h1 class="mt-3 text-3xl font-black tracking-tight text-body">Frequently asked questions</h1>

    <div class="mt-6 space-y-2">
      <div
        v-for="item in faqs"
        :key="item.id"
        class="bg-panel border border-wire rounded-xl overflow-hidden"
      >
        <button
          type="button"
          class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-sheet/50 transition-colors"
          @click="toggle(item.id)"
        >
          <span class="font-bold text-body">{{ item.question }}</span>
          <span
            class="material-symbols-outlined text-soft transition-transform"
            :class="openId === item.id ? 'rotate-180' : ''"
          >
            expand_more
          </span>
        </button>
        <div
          v-if="openId === item.id"
          class="px-5 pb-4 text-sm text-soft leading-relaxed border-t border-wire-subtle pt-4"
        >
          {{ item.answer }}
        </div>
      </div>
    </div>
  </section>
</template>
