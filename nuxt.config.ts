export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: ['@nuxtjs/tailwindcss', '@vercel/speed-insights/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700;800&display=swap' },
      ],
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL,
    anthropicAuthToken: process.env.ANTHROPIC_AUTH_TOKEN,
    anthropicSonnetModel: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL,
    anthropicHaikuModel: process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL,
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel: process.env.GROQ_MODEL,
    whatsappApiUrl: process.env.WHATSAPP_API_URL,
    whatsappFonnteToken: process.env.WHATSAPP_API_TOKEN_FONNTE,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },
})
