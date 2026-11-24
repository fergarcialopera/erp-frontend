import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const pwaIcons = [
  {
    src: "favicon/web-app-manifest-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "favicon/web-app-manifest-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "favicon/web-app-manifest-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "maskable",
  },
  {
    src: "favicon/web-app-manifest-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  logLevel: "error",
  base: "/",
  server: {
    host: "::",
    port: 8081,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      // Registro solo vía virtual:pwa-register (PwaRegister.tsx)
      injectRegister: false,
      includeAssets: [
        "favicon/favicon.ico",
        "favicon/favicon.svg",
        "favicon/favicon-96x96.png",
        "favicon/apple-touch-icon.png",
        "favicon/web-app-manifest-192x192.png",
        "favicon/web-app-manifest-512x512.png",
      ],
      manifest: {
        name: "LogiLock",
        short_name: "LogiLock",
        description: "Gestión de ambientes, inventario y órdenes para clínicas.",
        lang: "es",
        // Rutas relativas al origen del manifest (evita roturas con proxies).
        start_url: "./",
        scope: "./",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "any",
        background_color: "#F7FAFC",
        theme_color: "#06162D",
        categories: ["business", "productivity"],
        prefer_related_applications: false,
        icons: pwaIcons,
      },
      workbox: {
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
