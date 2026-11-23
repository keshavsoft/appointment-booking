import http from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";

const PORT = Number(process.env.PORT) || 3002;
const publicDir = fileURLToPath(new URL("./public/", import.meta.url));

const serveStatic = sirv(publicDir, {
  dev: true,
  extensions: ["html"],
  setHeaders(res) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
  }
});

const server = http.createServer((req, res) => {
  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CareCall Booking (Prototype) running on http://0.0.0.0:${PORT}`);
  console.log(`Open in browser: http://localhost:${PORT}/`);
});
