import { createDashboardDb as createSharedDb, recalcSummary as recalcSharedSummary } from "../utils/dashboard-db";
import type { ServerDb } from "./types";

export function createDashboardDb(): ServerDb {
  return createSharedDb();
}

export function recalcSummary(db: ServerDb): void {
  recalcSharedSummary(db);
}
