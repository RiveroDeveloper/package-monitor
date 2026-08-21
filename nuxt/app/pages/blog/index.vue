<script setup lang="ts">
import { posts } from '~/data/blog';

useHead({ title: 'Blog — PackTrack Hybrid' });
</script>

<template>
  <section>
    <div class="mb-8">
      <RenderModeBadge mode="SSG" class="mb-3" />
      <h1 class="text-3xl font-black tracking-tight text-body">Blog</h1>
      <p class="mt-2 text-soft">Articles, statically generated at build time.</p>
    </div>

    <ul class="space-y-3">
      <li
        v-for="post in posts"
        :key="post.slug"
        class="bg-panel border border-wire rounded-xl p-5 hover:border-primary/40 transition-colors"
      >
        <NuxtLink :to="`/blog/${post.slug}`" class="block">
          <h2 class="text-lg font-black text-body mb-1 hover:text-primary transition-colors">
            {{ post.title }}
          </h2>
          <p class="text-sm text-soft leading-relaxed mb-2">
            {{ post.excerpt }}
          </p>
          <p class="text-xs text-faded">{{ post.author }} · {{ post.date }}</p>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
