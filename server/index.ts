import http from "node:http";
import { getServerConfig } from "./config";
import { createDashboardDb, recalcSummary } from "./data";
import { sendJson } from "./http";
import { openApiDocument } from "./openapi";
import { SCENARIO_OPTIONS } from "../utils/scenario-catalog";
import { buildSwaggerPage } from "./swagger-page";

const config = getServerConfig();
const db = createDashboardDb();

const server = http.createServer(async (req, res) => {
  const send = (
    status: number,
    payload: unknown,
    extraHeaders?: Record<string, string>,
  ) => sendJson(res, status, payload, { corsOrigin: config.corsOrigin, extraHeaders });

  if (!req.url) {
    send(400, { error: "Invalid URL" });
    return;
  }

  const url = new URL(req.url, `http://localhost:${config.port}`);

  if (req.method === "OPTIONS") {
    send(200, { ok: true });
    return;
  }

  if (req.method === "GET" && url.pathname === "/healthz") {
    send(200, {
      status: "ok",
      service: config.appName,
      env: config.appEnv,
      version: config.appVersion,
      time: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/readyz") {
    send(200, {
      status: "ready",
      checks: {
        memoryDb: "ok",
      },
      time: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/version") {
    send(200, {
      name: config.appName,
      env: config.appEnv,
      version: config.appVersion,
      node: process.version,
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/openapi.json") {
    send(200, openApiDocument);
    return;
  }

  if (config.swaggerEnabled && req.method === "GET" && url.pathname === "/swagger") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(buildSwaggerPage());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/meta") {
    send(200, { scenarios: SCENARIO_OPTIONS });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/dashboard") {
    send(200, db);
    return;
  }

  const resolveMatch = url.pathname.match(/^\/api\/issues\/([^/]+)\/resolve$/);
  if (req.method === "POST" && resolveMatch) {
    const id = resolveMatch[1];
    const target = db.issues.find((issue) => issue.id === id);
    if (!target) {
      send(404, { error: "Issue not found" });
      return;
    }

    target.status = "done";
    target.usersImpacted = 0;
    recalcSummary(db);
    send(200, { ok: true, issue: target });
    return;
  }

  send(404, { error: "Not found" });
});

server.listen(config.port, config.host, () => {
  console.log(`Node API listening at http://${config.host}:${config.port}`);
  console.log(`Environment: ${config.appEnv} | Version: ${config.appVersion}`);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down Node API...`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
