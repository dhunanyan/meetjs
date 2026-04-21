import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

const START_OPTIONS = {
  onUnhandledRequest: "bypass" as const,
  serviceWorker: {
    url: "/mockServiceWorker.js",
  },
};

let started = false;

export async function enableMsw() {
  if (started) return;
  await worker.start(START_OPTIONS);
  started = true;
}

export function disableMsw() {
  if (!started) return;
  worker.stop();
  started = false;
}

export async function setMswInterception(enabled: boolean) {
  if (enabled) {
    await enableMsw();
    return;
  }
  disableMsw();
}
