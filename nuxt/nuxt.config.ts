// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
import { posts } from './app/data/blog';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Hybrid rendering rules:
  // - /blog/**       pre-rendered at build time (SSG)
  // - /warehouses/** rendered server-side on each request (SSR)
  // - /tools/**      rendered only on the client (CSR)
  routeRules: {
    '/blog/**': { prerender: true },
    '/warehouses/**': { ssr: true },
    '/tools/**': { ssr: false },
  },

  nitro: {
    prerender: {
      // Tell Nitro which dynamic blog routes to crawl at build time.
      routes: posts.map((post) => `/blog/${post.slug}`),
    },
  },

  app: {
    head: {
      title: 'PackTrack Hybrid',
    },
  },

  modules: ['@nuxt/eslint'],
});
