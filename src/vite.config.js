import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png"],
      workbox: {
        // Sin esto, el service worker de la PWA redirige CUALQUIER navegación
        // (incluida la de un archivo de audio) de vuelta a la app. Excluimos
        // archivos de audio para que se sirvan tal cual, sin redirigir.
        navigateFallbackDenylist: [/\.(mp3|mp4|wav|m4a|ogg)$/i],
      },
      manifest: {
        name: "Restauración y Avivamiento",
        short_name: "Restauración",
        description: "Devocionales diarios, reuniones y novedades de la iglesia Restauración y Avivamiento",
        theme_color: "#12151C",
        background_color: "#12151C",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
