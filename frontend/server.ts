import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const API_URL = process.env.VITE_API_PROXY_TARGET || "http://localhost:5000";

app.use(express.json());

// Proxy all API requests to the Express backend
app.use(
  "/api",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
  })
);

async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Static file production serving registered at ${distPath}.`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend server at http://localhost:${PORT}`);
    console.log(`API proxied to ${API_URL}`);
  });
}

serveApp().catch((err) => {
  console.error("Uncaught server startup error:", err);
});
