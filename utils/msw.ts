import type { Scenario } from "@/utils/types";

export function isMswEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_API_MOCKING !== "disabled";
}

export function readScenarioFromRequest(request: Request): Scenario {
  const url = new URL(request.url);
  const query = url.searchParams.get("scenario");
  return (query ?? "happy-path") as Scenario;
}

export function resolveFlakyScenario(scenario: Scenario): Scenario {
  if (scenario !== "flaky") return scenario;
  const roll = Math.random();
  if (roll < 0.25) return "server-500";
  if (roll < 0.5) return "network-error";
  if (roll < 0.75) return "auth-expired";
  if (roll < 0.9) return "slow-3s";
  return "happy-path";
}
