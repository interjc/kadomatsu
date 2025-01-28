// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 完全禁用 SSR
  ssr: false,

  modules: ["@nuxt/ui"],

  ui: {
    global: true,
  },

  runtimeConfig: {
    openaiBaseUrl: process.env.NUXT_OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || '',
    openaiModel: process.env.NUXT_OPENAI_MODEL || 'gpt-4o-mini',
    public: {
      // 这里放置可以暴露给客户端的配置
    }
  },

  nitro: {
    // 添加这个配置以支持 multipart/form-data
    experimental: {
      asyncContext: true
    }
  },

  vite: {
    build: {
      target: ["esnext"],
    },
  },

  app: {
    head: {
      title: '音频转字幕',
      meta: [
        {
          "http-equiv": "Cross-Origin-Embedder-Policy",
          content: "require-corp",
        },
        {
          "http-equiv": "Cross-Origin-Opener-Policy",
          content: "same-origin",
        },
      ],
    },
  },

  compatibilityDate: "2024-11-08",
});
