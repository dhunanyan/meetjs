import { NextResponse } from "next/server";
import { isLocalApiDisabled, localApiDisabledResponse } from "@/api-data/availability";
import { db, recalcSummary } from "@/api-data/dashboard-data";
import { readScenarioFromRequest, resolveFlakyScenario } from "@/utils/msw";

export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (isLocalApiDisabled(request)) return localApiDisabledResponse();
  const scenario = resolveFlakyScenario(readScenarioFromRequest(request));

  if (scenario === "slow-3s") {
    await sleep(3000);
  } else {
    await sleep(120);
  }

  if (scenario === "server-500") {
    return NextResponse.json({ error: "Resolve API failed (real route simulation)." }, { status: 500 });
  }
  if (scenario === "network-error") {
    return NextResponse.json({ error: "Network unavailable (simulated)." }, { status: 503 });
  }
  if (scenario === "auth-expired") {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  const { id } = await params;
  const target = db.issues.find((issue) => issue.id === id);

  if (!target) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  target.status = "done";
  target.usersImpacted = 0;
  recalcSummary();
  return NextResponse.json(
    { ok: true, issue: target },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
