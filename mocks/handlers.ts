import { http, HttpResponse, delay } from "msw";
import { SCENARIO_OPTIONS } from "@/utils/scenario-catalog";
import { readScenarioFromRequest, resolveFlakyScenario } from "@/utils/msw";
import type { DashboardPayload, Issue, Scenario } from "@/utils/types";

const issueTitles = [
  "Cart quantity reverts on concurrent tab update",
  "Image CDN fallback returns 403 for AVIF",
  "Order tracking panel stale after route transition",
  "A/B event naming mismatch in recommendation module",
  "Checkout promo code resets after currency switch",
  "Notification drawer opens behind modal backdrop",
  "Product card shimmer never ends on weak network",
  "Address autocomplete returns stale district value",
  "Payment method chip not selected after rerender",
  "Media gallery keyboard navigation skips first slide",
  "Server action retry creates duplicate analytics events",
  "Inline search result badges lose theme variables",
];

const services = [
  "web-cart",
  "web-media",
  "web-orders",
  "web-growth",
  "web-checkout",
  "web-notify",
  "web-feed",
  "web-address",
  "web-payments",
  "web-gallery",
  "web-actions",
  "web-search",
];

const owners = [
  "Elena M.",
  "Pavel N.",
  "Sofia K.",
  "Micha V.",
  "Nina P.",
  "Anton B.",
];

function createIssues(count: number): Issue[] {
  const priorities: Issue["priority"][] = [
    "critical",
    "high",
    "high",
    "medium",
    "medium",
    "low",
  ];
  const statuses: Issue["status"][] = [
    "open",
    "in-progress",
    "blocked",
    "done",
    "in-progress",
    "open",
  ];
  const startId = 7050;
  const startDate = Date.parse("2026-02-20T10:50:00Z");

  return Array.from({ length: count }, (_, i) => {
    const done = statuses[i % statuses.length] === "done";
    return {
      id: `INC-${startId - i}`,
      title: issueTitles[i % issueTitles.length],
      service: services[i % services.length],
      owner: owners[i % owners.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      createdAt: new Date(startDate - i * 34 * 60 * 1000).toISOString(),
      usersImpacted: done ? 0 : Math.max(40, 2600 - i * 57),
    };
  });
}

const issues: Issue[] = createIssues(45);

const basePayload: DashboardPayload = {
  summary: {
    total: issues.length,
    open: issues.filter(
      (i) => i.status === "open" || i.status === "in-progress",
    ).length,
    blocked: issues.filter((i) => i.status === "blocked").length,
    doneToday: 4,
    affectedUsers: issues.reduce((acc, item) => acc + item.usersImpacted, 0),
  },
  issues,
  releases: [
    {
      id: "REL-1202",
      branch: "release/web-2.22.0",
      commit: "81cf302",
      deployedAt: "2026-02-20T09:50:00Z",
      author: "Elena M.",
      result: "warning",
    },
    {
      id: "REL-1201",
      branch: "fix/cdn-avif-fallback",
      commit: "18ef0d2",
      deployedAt: "2026-02-20T07:40:00Z",
      author: "Pavel N.",
      result: "success",
    },
    {
      id: "REL-1200",
      branch: "chore/auth-cookie-hardening",
      commit: "6b20a9a",
      deployedAt: "2026-02-19T16:11:00Z",
      author: "Sofia K.",
      result: "success",
    },
    {
      id: "REL-1199",
      branch: "fix/checkout-promo-race",
      commit: "bb91331",
      deployedAt: "2026-02-19T13:40:00Z",
      author: "Nina P.",
      result: "warning",
    },
    {
      id: "REL-1198",
      branch: "release/web-2.21.3",
      commit: "7f31b7e",
      deployedAt: "2026-02-19T09:14:00Z",
      author: "Elena M.",
      result: "success",
    },
    {
      id: "REL-1197",
      branch: "hotfix/session-refresh-loop",
      commit: "1c95fe2",
      deployedAt: "2026-02-18T22:28:00Z",
      author: "Pavel N.",
      result: "failed",
    },
  ],
  health: [
    { name: "Error rate", value: "2.4%", trend: "up" },
    { name: "P95 API latency", value: "448ms", trend: "up" },
    { name: "LCP", value: "2.7s", trend: "down" },
    { name: "Conversion", value: "2.5%", trend: "down" },
  ],
};

function routeVariants(path: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  return base ? [path, `${base}${path}`] : [path];
}

async function applyDelay(scenario: Scenario) {
  if (scenario === "slow-3s") {
    await delay(3000);
    return;
  }
  await delay(200);
}

function errorsFor(scenario: Scenario) {
  if (scenario === "server-500") {
    return HttpResponse.json({ error: "Incident API failed" }, { status: 500 });
  }
  if (scenario === "network-error") {
    return HttpResponse.error();
  }
  if (scenario === "auth-expired") {
    return HttpResponse.json({ error: "Session expired" }, { status: 401 });
  }
  return null;
}

function payloadFor(scenario: Scenario) {
  if (scenario === "partial-data") {
    return {
      ...basePayload,
      issues: [
        { ...basePayload.issues[0], owner: "" },
        { ...basePayload.issues[1], title: "" },
        { ...basePayload.issues[2], usersImpacted: 0 },
      ],
    };
  }

  if (scenario === "contract-drift") {
    return {
      summary: {
        total_count: basePayload.summary.total,
        opened_count: basePayload.summary.open,
        blocked_count: basePayload.summary.blocked,
        resolved_today: basePayload.summary.doneToday,
        users_affected: basePayload.summary.affectedUsers,
      },
      incidents: basePayload.issues.map((issue) => ({
        incident_id: issue.id,
        incident_title: issue.title,
        service_name: issue.service,
        engineer: issue.owner,
        priority: issue.priority,
        status: issue.status,
        created_at: issue.createdAt,
        impacted_users: issue.usersImpacted,
      })),
      releases: basePayload.releases,
      health_metrics: basePayload.health,
    };
  }

  return basePayload;
}

export const handlers = [
  ...routeVariants("/api/meta").map((path) =>
    http.get(path, async () => {
      return HttpResponse.json({ scenarios: SCENARIO_OPTIONS });
    }),
  ),
  ...routeVariants("/api/dashboard").map((path) =>
    http.get(path, async ({ request }) => {
      const scenario = resolveFlakyScenario(readScenarioFromRequest(request));
      await applyDelay(scenario);

      const error = errorsFor(scenario);
      if (error) return error;

      return HttpResponse.json(payloadFor(scenario));
    }),
  ),
  ...routeVariants("/api/issues/:id/resolve").map((path) =>
    http.post(path, async ({ request, params }) => {
      const scenario = resolveFlakyScenario(readScenarioFromRequest(request));
      await applyDelay(scenario);

      const error = errorsFor(scenario);
      if (error) return error;

      const issue = basePayload.issues.find((item) => item.id === params.id);
      if (!issue)
        return HttpResponse.json({ error: "Issue not found" }, { status: 404 });
      issue.status = "done";
      issue.usersImpacted = 0;

      basePayload.summary.open = basePayload.issues.filter(
        (item) => item.status === "open" || item.status === "in-progress",
      ).length;
      basePayload.summary.blocked = basePayload.issues.filter(
        (item) => item.status === "blocked",
      ).length;
      basePayload.summary.affectedUsers = basePayload.issues.reduce(
        (acc, item) => acc + item.usersImpacted,
        0,
      );

      return HttpResponse.json({ ok: true, issue });
    }),
  ),
];
