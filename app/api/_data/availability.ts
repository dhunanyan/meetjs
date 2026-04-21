import { NextResponse } from "next/server";

export function isLocalApiDisabled(request?: Request) {
  const fromEnv = process.env.NEXT_DISABLE_LOCAL_API === "true";
  if (!request) return fromEnv;
  const query = new URL(request.url).searchParams.get("localApiDisabled") === "true";
  return fromEnv || query;
}

export function localApiDisabledResponse() {
  return NextResponse.json(
    { error: "Local API is disabled for demo mode." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
