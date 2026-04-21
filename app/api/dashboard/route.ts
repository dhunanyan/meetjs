import { NextResponse } from "next/server";
import { isLocalApiDisabled, localApiDisabledResponse } from "@/api-data/availability";
import { db } from "@/api-data/dashboard-data";
import { readScenarioFromRequest, resolveFlakyScenario } from "@/utils/msw";

export const dynamic = "force-dynamic";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  if (isLocalApiDisabled(request)) return localApiDisabledResponse();
  const scenario = resolveFlakyScenario(readScenarioFromRequest(request));

  if (scenario === "slow-3s") {
    await sleep(3000);
  } else {
    await sleep(120);
  }

  if (scenario === "server-500") {
    return NextResponse.json({ error: "Incident API failed (real route simulation)." }, { status: 500 });
  }
  if (scenario === "network-error") {
    return NextResponse.json({ error: "Network unavailable (simulated)." }, { status: 503 });
  }
  if (scenario === "auth-expired") {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  if (scenario === "partial-data") {
    return NextResponse.json(
      {
        ...db,
        issues: [
          { ...db.issues[0], owner: "" },
          { ...db.issues[1], title: "" },
          { ...db.issues[2], usersImpacted: 0 },
        ],
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (scenario === "contract-drift") {
    return NextResponse.json(
      {
        summary: {
          total_count: db.summary.total,
          opened_count: db.summary.open,
          blocked_count: db.summary.blocked,
          resolved_today: db.summary.doneToday,
          users_affected: db.summary.affectedUsers,
        },
        incidents: db.issues.map((issue) => ({
          incident_id: issue.id,
          incident_title: issue.title,
          service_name: issue.service,
          engineer: issue.owner,
          priority: issue.priority,
          status: issue.status,
          created_at: issue.createdAt,
          impacted_users: issue.usersImpacted,
        })),
        releases: db.releases,
        health_metrics: db.health,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(db, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
