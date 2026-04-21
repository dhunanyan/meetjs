import { NextResponse } from "next/server";
import { isLocalApiDisabled, localApiDisabledResponse } from "@/api-data/availability";
import { SCENARIO_OPTIONS } from "@/utils/scenario-catalog";

export async function GET(request: Request) {
  if (isLocalApiDisabled(request)) return localApiDisabledResponse();
  return NextResponse.json(
    { scenarios: SCENARIO_OPTIONS },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
