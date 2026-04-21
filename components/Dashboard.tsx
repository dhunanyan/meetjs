"use client";

import * as React from "react";
import Image from "next/image";
import { useMsw } from "@/context";
import { CustomSelect, type SelectOption } from "@/components/ui/custom-select";
import { LoadingState } from "@/components/ui/loading-state";
import {
  fetchDashboard,
  fetchDashboardMetaForTarget,
  resolveIssue,
} from "@/utils/client-api";
import type { DashboardPayload, Scenario, ScenarioOption } from "@/utils/types";

const sourceOptions: SelectOption<"msw" | "real">[] = [
  { value: "msw", label: "MSW Intercept", hint: "Intercept in browser" },
  {
    value: "real",
    label: "Bypass to Real API",
    hint: "Skip worker for integration",
  },
];

function fmtDate(v: string) {
  return new Date(v).toLocaleString("en-GB", { hour12: false });
}

function statusClass(status: string) {
  return `status ${status}`;
}

function releaseClass(result: string) {
  return `release-tag ${result}`;
}

function trendClass(trend: string) {
  return `trend ${trend}`;
}

export function Dashboard() {
  const [scenario, setScenario] = React.useState<Scenario>("happy-path");
  const [scenarioOptions, setScenarioOptions] = React.useState<
    SelectOption<Scenario>[]
  >([]);
  const [source, setSource] = React.useState<"msw" | "real">("msw");
  const [apiTarget, setApiTarget] = React.useState<"local" | "external">(
    "external",
  );
  const [localApiDisabled, setLocalApiDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [metaLoading, setMetaLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [payload, setPayload] = React.useState<DashboardPayload | null>(null);
  const [backendUnavailable, setBackendUnavailable] = React.useState(false);

  const { mockingEnabled, setInterceptionEnabled } = useMsw();
  const bypassMsw = source === "real";
  const hasExternalApi = Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
  const externalApiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

  const activeSource = React.useMemo(() => {
    if (!mockingEnabled) return "Real API (MSW disabled)";
    return bypassMsw ? "Real API (MSW bypass)" : "MSW mocked API";
  }, [bypassMsw, mockingEnabled]);
  const scenarioSelectOptions = React.useMemo<SelectOption<Scenario>[]>(() => {
    if (source === "real") {
      return [
        {
          value: scenario,
          label: "No options",
          hint: "Switch to MSW Intercept to choose a scenario",
        },
      ];
    }
    return scenarioOptions;
  }, [source, scenario, scenarioOptions]);

  React.useEffect(() => {
    if (!hasExternalApi) setApiTarget("local");
  }, [hasExternalApi]);

  React.useEffect(() => {
    if (!mockingEnabled) return;
    let active = true;

    const syncMockingMode = async () => {
      if (!active) return;
      await setInterceptionEnabled(source === "msw");
    };

    void syncMockingMode();
    return () => {
      active = false;
    };
  }, [mockingEnabled, source, setInterceptionEnabled]);

  React.useEffect(() => {
    if (apiTarget !== "external" || !hasExternalApi || !externalApiBaseUrl) {
      setBackendUnavailable(false);
      return;
    }

    let active = true;

    const probeBackend = async () => {
      try {
        const res = await fetch(`${externalApiBaseUrl}/healthz`, {
          method: "GET",
          cache: "no-store",
        });
        if (!active) return;
        setBackendUnavailable(!res.ok);
      } catch {
        if (!active) return;
        setBackendUnavailable(true);
      }
    };

    void probeBackend();
    return () => {
      active = false;
    };
  }, [apiTarget, hasExternalApi, externalApiBaseUrl]);

  React.useEffect(() => {
    async function loadMeta() {
      setMetaLoading(true);
      try {
        const meta = await fetchDashboardMetaForTarget({
          source,
          apiTarget,
          localApiDisabled,
        });
        setBackendUnavailable(false);
        const options = meta.scenarios as ScenarioOption[];
        setScenarioOptions(options);
        if (
          options.length > 0 &&
          !options.find((option) => option.value === scenario)
        ) {
          setScenario(options[0].value);
        }
      } catch {
        if (apiTarget === "external") {
          setBackendUnavailable(true);
        } else {
          setBackendUnavailable(false);
        }
        setScenarioOptions([]);
      } finally {
        setMetaLoading(false);
      }
    }
    void loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, apiTarget, localApiDisabled]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { payload: normalized, warnings } = await fetchDashboard({
        scenario,
        source,
        apiTarget,
        localApiDisabled,
      });
      setBackendUnavailable(false);
      setPayload(normalized);
      setWarnings(warnings);
    } catch (err) {
      if (apiTarget === "external") {
        setBackendUnavailable(true);
      }
      setPayload(null);
      setWarnings([]);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function onResolve(id: string) {
    try {
      await resolveIssue(id, {
        scenario,
        source,
        apiTarget,
        localApiDisabled,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolve failed");
    }
  }

  return (
    <main className={`app-shell ${loading ? "is-loading" : ""}`}>
      <aside className="sidebar reveal">
        <div className="side-brand">
          <Image src="/logos/msw.svg" alt="MSW logo" width={36} height={36} />
          <Image
            src="/logos/next.svg"
            alt="Next.js logo"
            width={36}
            height={36}
          />
        </div>
        <h2>Incident Studio</h2>
        <p className="side-muted">Frontend reliability demo environment</p>

        <nav className="side-nav">
          <button
            className={`nav-item ${apiTarget === "local" ? "active" : ""}`}
            onClick={() => setApiTarget("local")}
          >
            <span className="nav-icon">LC</span>
            <span>Local API (/api)</span>
          </button>
          <button
            className={`nav-item ${apiTarget === "external" ? "active" : ""}`}
            onClick={() => hasExternalApi && setApiTarget("external")}
            disabled={!hasExternalApi}
          >
            <span className="nav-icon">BE</span>
            <span>Backend Endpoint</span>
          </button>
        </nav>

        {apiTarget === "local" ? (
          <button
            className={`api-toggle-btn ${localApiDisabled ? "off" : "on"}`}
            onClick={() => setLocalApiDisabled((prev) => !prev)}
          >
            {localApiDisabled ? "Enable Local API" : "Disable Local API"}
          </button>
        ) : null}

        <div className="side-controls">
          <div className="control">
            <label>Scenario</label>
            <CustomSelect
              value={scenario}
              options={scenarioSelectOptions}
              onChange={setScenario}
              disabled={source === "real"}
            />
          </div>

          <div className="control">
            <label>Data Source</label>
            <CustomSelect
              value={source}
              options={sourceOptions}
              onChange={setSource}
              disabled={!mockingEnabled}
            />
          </div>

          <div className="btn-row side-btn-row">
            <button
              className="primary"
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              className="secondary"
              onClick={() => setScenario("happy-path")}
              disabled={loading}
            >
              Reset Scenario
            </button>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <section className="panel topbar reveal">
          <div>
            <h1>MSW Beyond Tests - Live Developer Dashboard</h1>
            <p className="sub">
              App Router + API Routes + runtime mock switching
            </p>
          </div>
          <div className="topbar-right">
            <span className="live-dot">Live</span>
            <span className="badge">{activeSource}</span>
          </div>
        </section>

        {!mockingEnabled ? (
          <div className="warn reveal">
            MSW is disabled in this run. Scenarios are simulated by API routes.
            <code>yarn dev:mock</code> enables browser interception.
          </div>
        ) : null}

        {apiTarget === "local" && localApiDisabled ? (
          <div className="warn reveal">
            Local <code>/api</code> is disabled from runtime control.
          </div>
        ) : null}

        {apiTarget === "external" && backendUnavailable ? (
          <div className="warn reveal">
            Backend endpoint is unreachable. Start <code>yarn dev:server</code>{" "}
            to run
            <code>localhost:8787</code>.
          </div>
        ) : null}

        {error ? <div className="alert reveal">{error}</div> : null}
        {warnings.length > 0 ? (
          <div className="warn reveal">
            {warnings.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
        ) : null}

        {metaLoading ? (
          <section className="panel loading-panel reveal">
            <LoadingState
              title="Loading Dashboard Configuration"
              subtitle="Fetching scenario catalog and runtime metadata"
            />
          </section>
        ) : null}

        {!metaLoading && loading && !payload && !error ? (
          <section className="panel loading-panel reveal">
            <LoadingState
              title="Loading Incident Data"
              subtitle="Syncing incidents, releases, and environment signals"
              compact
            />
          </section>
        ) : null}

        {payload ? (
          <>
            <section className="panel grid-kpi reveal">
              <div className="kpi">
                <span className="kpi-label">Total incidents</span>
                <b>{payload.summary.total}</b>
              </div>
              <div className="kpi">
                <span className="kpi-label">Open now</span>
                <b>{payload.summary.open}</b>
              </div>
              <div className="kpi">
                <span className="kpi-label">Blocked</span>
                <b>{payload.summary.blocked}</b>
              </div>
              <div className="kpi">
                <span className="kpi-label">Resolved today</span>
                <b>{payload.summary.doneToday}</b>
              </div>
              <div className="kpi">
                <span className="kpi-label">Impacted users</span>
                <b>{payload.summary.affectedUsers.toLocaleString()}</b>
              </div>
            </section>

            <section className="content-grid reveal">
              <section className="panel table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Service</th>
                      <th>Owner</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Impacted</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payload.issues.map((issue, index) => (
                      <tr
                        key={issue.id}
                        className="data-row"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        <td>{issue.id}</td>
                        <td className="title-cell">
                          {issue.title || (
                            <span className="muted">missing title</span>
                          )}
                        </td>
                        <td>{issue.service}</td>
                        <td>
                          {issue.owner || (
                            <span className="muted">missing owner</span>
                          )}
                        </td>
                        <td>{issue.priority}</td>
                        <td>
                          <span className={statusClass(issue.status)}>
                            {issue.status}
                          </span>
                        </td>
                        <td>{issue.usersImpacted.toLocaleString()}</td>
                        <td>{fmtDate(issue.createdAt)}</td>
                        <td>
                          <button
                            className="secondary"
                            onClick={() => void onResolve(issue.id)}
                            disabled={issue.status === "done"}
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="side-stack">
                <section className="panel side-card">
                  <div className="card-head">
                    <h3>Recent Releases</h3>
                    <span className="muted">Latest deployment states</span>
                  </div>
                  <div className="release-list">
                    {payload.releases.map((r) => (
                      <article key={r.id} className="release-item">
                        <div>
                          <strong>{r.id}</strong>
                          <p>
                            {r.branch} ({r.commit}) by {r.author}
                          </p>
                        </div>
                        <span className={releaseClass(r.result)}>
                          {r.result}
                        </span>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel side-card">
                  <div className="card-head">
                    <h3>Environment Health</h3>
                    <span className="muted">Signals from runtime metrics</span>
                  </div>
                  <div className="health-list">
                    {payload.health.map((h) => (
                      <article key={h.name} className="health-item">
                        <span>{h.name}</span>
                        <div>
                          <strong>{h.value}</strong>
                          <em className={trendClass(h.trend)}>{h.trend}</em>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </section>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
