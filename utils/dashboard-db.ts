import seedDb from "../db/dashboard.json";
import type { DashboardPayload } from "@/utils/types";

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDashboardDb(): DashboardPayload {
  return deepClone(seedDb as DashboardPayload);
}

export function recalcSummary(db: DashboardPayload): void {
  db.summary.total = db.issues.length;
  db.summary.open = db.issues.filter(
    (issue) => issue.status === "open" || issue.status === "in-progress",
  ).length;
  db.summary.blocked = db.issues.filter(
    (issue) => issue.status === "blocked",
  ).length;
  db.summary.affectedUsers = db.issues.reduce(
    (acc, issue) => acc + issue.usersImpacted,
    0,
  );
}
