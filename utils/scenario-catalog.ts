import type { ScenarioOption } from "./types";

export const SCENARIO_OPTIONS: ScenarioOption[] = [
  { value: "happy-path", label: "Happy Path", hint: "Stable baseline responses" },
  { value: "slow-3s", label: "Slow 3s", hint: "Latency and skeleton handling" },
  { value: "server-500", label: "Server 500", hint: "Backend error fallback" },
  { value: "network-error", label: "Network Error", hint: "Request failure simulation" },
  { value: "auth-expired", label: "Auth Expired", hint: "401 and session handling" },
  { value: "partial-data", label: "Partial Data", hint: "Missing fields resilience" },
  { value: "contract-drift", label: "Contract Drift", hint: "Schema mismatch warnings" },
  { value: "flaky", label: "Flaky", hint: "Randomized unstable behavior" },
];
