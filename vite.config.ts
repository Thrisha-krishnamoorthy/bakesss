import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Check if certificate files exist
const certPath = path.resolve(__dirname, "certs/cert.pem");
const keyPath = path.resolve(__dirname, "certs/key.pem");
const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    https: hasCerts ? {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    } : {}, // Empty object will use auto-generated certificates
  },
  plugins: [
    react(),
    // @ts-ignore - Ignore the type error for componentTagger
    componentTagger({
      prefix: "BG",
      dir: path.resolve(__dirname, "src/components"),
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
