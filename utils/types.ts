export type IssueStatus = "open" | "in-progress" | "blocked" | "done";

export type IssuePriority = "critical" | "high" | "medium" | "low";

export type Issue = {
  id: string;
  title: string;
  service: string;
  owner: string;
  priority: IssuePriority;
  status: IssueStatus;
  createdAt: string;
  usersImpacted: number;
};

export type Release = {
  id: string;
  branch: string;
  commit: string;
  deployedAt: string;
  author: string;
  result: "success" | "warning" | "failed";
};

export type HealthMetric = {
  name: string;
  value: string;
  trend: "up" | "down" | "flat";
};

export type DashboardPayload = {
  summary: {
    total: number;
    open: number;
    blocked: number;
    doneToday: number;
    affectedUsers: number;
  };
  issues: Issue[];
  releases: Release[];
  health: HealthMetric[];
};

export type Scenario =
  | "happy-path"
  | "slow-3s"
  | "server-500"
  | "network-error"
  | "auth-expired"
  | "partial-data"
  | "contract-drift"
  | "flaky";

export type ScenarioOption = {
  value: Scenario;
  label: string;
  hint?: string;
};
