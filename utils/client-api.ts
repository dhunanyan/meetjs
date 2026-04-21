import type {
  DashboardPayload,
  HealthMetric,
  Issue,
  Release,
  Scenario,
  ScenarioOption,
} from "@/utils/types";

type FetchOpts = {
  scenario: Scenario;
  source: "msw" | "real";
  apiTarget: "local" | "external";
  localApiDisabled: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

function apiUrl(path: string, params: URLSearchParams | undefined, apiTarget: "local" | "external") {
  const query = params?.toString();
  const fullPath = query ? `${path}?${query}` : path;
  if (apiTarget === "external" && API_BASE_URL) return `${API_BASE_URL}${fullPath}`;
  return fullPath;
}

function toIssues(input: unknown, warnings: string[]): Issue[] {
  if (!Array.isArray(input)) {
    warnings.push("issues: expected array");
    return [];
  }

  return input.map((item, idx) => {
    const v = item as Record<string, unknown>;
    const issue: Issue = {
      id: String(v.id ?? v.incident_id ?? ""),
      title: String(v.title ?? v.incident_title ?? ""),
      service: String(v.service ?? v.service_name ?? ""),
      owner: String(v.owner ?? v.engineer ?? ""),
      priority: String(v.priority ?? "low") as Issue["priority"],
      status: String(v.status ?? "open") as Issue["status"],
      createdAt: String(v.createdAt ?? v.created_at ?? new Date().toISOString()),
      usersImpacted: Number(v.usersImpacted ?? v.impacted_users ?? 0),
    };
    if (!issue.id) warnings.push(`issues[${idx}]: missing id`);
    if (!issue.title) warnings.push(`issues[${idx}]: missing title`);
    if (!issue.owner) warnings.push(`issues[${idx}]: missing owner`);
    return issue;
  });
}

function toReleases(input: unknown): Release[] {
  if (!Array.isArray(input)) return [];
  return input as Release[];
}

function toHealth(input: unknown): HealthMetric[] {
  if (!Array.isArray(input)) return [];
  return input as HealthMetric[];
}

export function normalizeDashboard(raw: unknown) {
  const warnings: string[] = [];
  const data = raw as Record<string, unknown>;

  const rawSummary = (data.summary as Record<string, unknown>) ?? {};
  const issues = toIssues(data.issues ?? data.incidents, warnings);

  const payload: DashboardPayload = {
    summary: {
      total: Number(rawSummary.total ?? rawSummary.total_count ?? issues.length),
      open: Number(rawSummary.open ?? rawSummary.opened_count ?? 0),
      blocked: Number(rawSummary.blocked ?? rawSummary.blocked_count ?? 0),
      doneToday: Number(rawSummary.doneToday ?? rawSummary.resolved_today ?? 0),
      affectedUsers: Number(rawSummary.affectedUsers ?? rawSummary.users_affected ?? 0),
    },
    issues,
    releases: toReleases(data.releases),
    health: toHealth(data.health ?? data.health_metrics),
  };

  return { payload, warnings };
}

export async function fetchDashboardMetaForTarget(opts: {
  source: "msw" | "real";
  apiTarget: "local" | "external";
  localApiDisabled: boolean;
}) {
  const params = new URLSearchParams();
  if (opts.apiTarget === "local" && opts.localApiDisabled && opts.source === "real") {
    params.set("localApiDisabled", "true");
  }
  const res = await fetch(apiUrl("/api/meta", params, opts.apiTarget), {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Meta request failed: ${res.status}`);
  }
  const data = (await res.json()) as { scenarios?: ScenarioOption[] };
  return { scenarios: Array.isArray(data.scenarios) ? data.scenarios : [] };
}

export async function fetchDashboard(opts: FetchOpts) {
  const params = new URLSearchParams();
  if (opts.source === "msw") params.set("scenario", opts.scenario);
  if (opts.apiTarget === "local" && opts.localApiDisabled && opts.source === "real") {
    params.set("localApiDisabled", "true");
  }
  const res = await fetch(apiUrl("/api/dashboard", params, opts.apiTarget), {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: string };
      detail = body.error ? ` (${body.error})` : "";
    } catch {
      // ignore
    }
    throw new Error(`Dashboard request failed: ${res.status}${detail}`);
  }

  return normalizeDashboard(await res.json());
}

export async function resolveIssue(id: string, opts: FetchOpts) {
  const params = new URLSearchParams();
  if (opts.source === "msw") params.set("scenario", opts.scenario);
  if (opts.apiTarget === "local" && opts.localApiDisabled && opts.source === "real") {
    params.set("localApiDisabled", "true");
  }
  const res = await fetch(apiUrl(`/api/issues/${id}/resolve`, params, opts.apiTarget), {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Resolve request failed: ${res.status}`);
  }
}
