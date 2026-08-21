<script setup lang="ts">
import { posts } from '~/data/blog';

definePageMeta({
  validate(route) {
    const slug = String(route.params.slug);
    return posts.some((post) => post.slug === slug);
  },
});

const route = useRoute();
const post = computed(() => {
  const slug = String(route.params.slug);
  return posts.find((post) => post.slug === slug);
});

useHead(() => ({
  title: post.value ? `${post.value.title} — PackTrack Blog` : 'Blog post',
}));
</script>

<template>
  <article v-if="post" class="max-w-3xl">
    <NuxtLink to="/blog" class="text-sm text-soft hover:text-primary transition-colors">
      ← All posts
    </NuxtLink>
    <h1 class="mt-3 text-3xl md:text-4xl font-black tracking-tight text-body">
      {{ post.title }}
    </h1>
    <p class="mt-2 text-sm text-faded">{{ post.author }} · {{ post.date }}</p>
    <div class="mt-6 space-y-4">
      <p v-for="(paragraph, i) in post.body" :key="i" class="text-base text-soft leading-relaxed">
        {{ paragraph }}
      </p>
    </div>
  </article>
</template>
