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
  const host = req.headers.host || "127.0.0.1";
  const proto = req.headers["x-forwarded-proto"] || "http";
  let path = "/";
  try {
    path = new URL(req.url, `${proto}://${host}`).pathname;
  } catch {
    path = req.url || "/";
  }

  if (path === "/v1" || path === "/v1/") req.url = "/v1/index.html";
  else if (path === "/v2" || path === "/v2/") req.url = "/v2/index.html";
  else if (path === "/v3" || path === "/v3/") req.url = "/v3/index.html";

  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CareCall Booking running on http://0.0.0.0:${PORT}`);
  console.log(`- Gateway Hub:    http://localhost:${PORT}/`);
  console.log(`- Simple V-3:     http://localhost:${PORT}/v3/`);
  console.log(`- Reception V-2:  http://localhost:${PORT}/v2/`);
  console.log(`- Doctor Queue:   http://localhost:${PORT}/v2/queue.html`);
  console.log(`- Prototype V-1:  http://localhost:${PORT}/v1/`);
});
