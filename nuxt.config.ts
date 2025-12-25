// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui"],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  ssr: false, // Client-side only

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  // Disable external font fetching for GDPR compliance
  fonts: {
    provider: "none",
  },

  // Force light mode only - disable dark mode
  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },

  vite: {
    optimizeDeps: {
      exclude: ["onnxruntime-web", "onnxruntime-node"],
    },
    resolve: {
      alias: {
        // Force onnxruntime-node to resolve to onnxruntime-web in browser
        "onnxruntime-node": "onnxruntime-web",
      },
    },
    worker: {
      format: "es",
    },
  },
});
