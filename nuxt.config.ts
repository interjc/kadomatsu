// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 完全禁用 SSR
  ssr: false,

  modules: [
    "@nuxt/ui",
    "nuxt-icon"
  ],

  ui: {
    global: true,
  },

  runtimeConfig: {
    openaiBaseUrl:
      process.env.NUXT_OPENAI_BASE_URL || "https://api.openai.com/v1",
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || "",
    openaiModel: process.env.NUXT_OPENAI_MODEL || "gpt-4o-mini",
    public: {
      // 这里放置可以暴露给客户端的配置
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://newyear.zhaikr.com',
    },
  },

  nitro: {
    // 添加这个配置以支持 multipart/form-data
    experimental: {
      asyncContext: true,
    },
  },

  vite: {
    build: {
      target: ["esnext"],
    },
  },

  app: {
    head: {
      title: '新年祝福小助手 - AI 帮你写出暖心祝福',
      titleTemplate: '%s - 让心意传递更有温度',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'description',
          content: 'AI 驱动的新年祝福生成器，帮你写出暖心祝福，支持多种场景：给长辈、朋友、同事等，让心意传递更有温度。'
        },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '新年祝福小助手' },
        { property: 'og:title', content: '新年祝福小助手 - AI 帮你写出暖心祝福' },
        { property: 'og:description', content: 'AI 驱动的新年祝福生成器，帮你写出暖心祝福，支持多种场景：给长辈、朋友、同事等，让心意传递更有温度。' },
        { property: 'og:image', content: '/android-chrome-512x512.png' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@interjc' },
        { name: 'twitter:creator', content: '@interjc' },
        // PWA
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        // Security
        { "http-equiv": "Cross-Origin-Embedder-Policy", content: "require-corp" },
        { "http-equiv": "Cross-Origin-Opener-Policy", content: "same-origin" },
      ],
      link: [
        // Favicon
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        // Apple Touch Icon
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        // Web Manifest
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  // SPA 相关配置
  experimental: {
    payloadExtraction: false
  },

  compatibilityDate: "2025-01-28",
});
