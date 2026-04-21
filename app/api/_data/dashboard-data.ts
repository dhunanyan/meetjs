import { createDashboardDb, recalcSummary as recalcSharedSummary } from "@/utils/dashboard-db";

export const db = createDashboardDb();

export function recalcSummary() {
  recalcSharedSummary(db);
}
