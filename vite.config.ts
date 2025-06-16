import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { handleApiRequest } from "./src/server/middleware";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "bokomon-api",
      configureServer(server) {
        server.middlewares.use("/api/bokomon", async (req, res, next) => {
          if (req.method === "POST") {
            try {
              const chunks: Buffer[] = [];
              req.on("data", (chunk) => chunks.push(chunk));
              req.on("end", async () => {
                const body = Buffer.concat(chunks).toString();
                const request = new Request("http://localhost/api/bokomon", {
                  method: "POST",
                  headers: req.headers as HeadersInit,
                  body,
                });

                const response = await handleApiRequest(request);
                const data = await response.json();

                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              });
            } catch (error) {
              console.error("Error handling request:", error);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Internal server error" }));
            }
          } else {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg"],
  server: {
    proxy: {
      "/api/bokomon": {
        target: "http://localhost:5173",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
});
