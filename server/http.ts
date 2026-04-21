import type { ServerResponse } from "node:http";

export function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
  opts?: { corsOrigin?: string; extraHeaders?: Record<string, string> },
): void {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": opts?.corsOrigin ?? "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    ...opts?.extraHeaders,
  });
  res.end(JSON.stringify(payload));
}
