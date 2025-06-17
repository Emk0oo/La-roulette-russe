import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      socketUrl: process.env.SOCKET_URL || "http://localhost:3001",
      appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["9e4c-159-180-237-155.ngrok-free.app"],
    },
  },
  nitro: {
    preset: "vercel",
    experimental: {
      websocket: true,
    },
  },
});
