# Full Speaker Script (15-18 minutes)

This script is aligned to `presentation/slides.md` and keeps the same slide order.

---

## Slide 1 - MSW Beyond Tests

Hi everyone, thanks for joining.
Today I want to talk about a very practical frontend challenge: how we keep shipping UI when backend is not ready, unstable, or temporarily down.
This is not a QA-only perspective.
It is a developer productivity and delivery reliability perspective.

---

## Slide 2 - Who This Talk Is For

This session is for frontend engineers who get blocked by backend dependencies, and for teams trying to ship in parallel.
If you’ve ever had a feature ready in UI but blocked by API readiness, this is exactly your use case.

---

## Slide 3 - The Core Problem

In normal project flow, we hit the same blockers repeatedly:
endpoint not ready, unstable shared environment, changing contracts.
The result is predictable: frontend work slows down for reasons unrelated to frontend logic.

---

## Slide 4 - What Usually Goes Wrong

Most teams react with quick fixes: hardcoded JSON, local fake handlers, different mocks in tests and stories.
Short-term this feels fast, but long-term it creates drift and false confidence.
Then integration day becomes painful.

---

## Slide 5 - Target State

Our target state is simple:
one real integration path, one mock boundary at network layer, runtime switching, and explicit warning signals in the UI.
That gives us speed without losing realism.

---

## Slide 6 - Live Demo Block (Handoff)

Now I’ll jump to the demo app.
In this part, please watch only five things:
API Target, Data Source, Scenario behavior, server ON/OFF effects, and Local API enable/disable.

---

## Slide 7 - Runtime Controls Used in Demo

In the sidebar, we control:
Local API or Backend Endpoint,
MSW Intercept or Bypass to Real API,
and Local API toggle.
Refresh is manual on purpose, so behavior changes are explicit and easy to explain.

---

## Slide 8 - Scenario Catalog Used in Demo

These are the scenarios we use:
happy path, slow, server error, network error, auth expired, partial data, contract drift, and flaky.
In this implementation, scenario control is meaningful in MSW mode; in Bypass mode it is intentionally disabled.

---

## Slide 9 - Demo Case 1 (Backend + MSW)

Case one is Backend Endpoint with MSW Intercept.
When backend is ON, UI still uses MSW response behavior.
When backend is OFF, frontend continues through MSW.
This is the first proof point: backend outage does not block frontend progress.

---

## Slide 10 - Demo Case 1 Sequence

I select Backend Endpoint, then MSW Intercept.
First show happy-path, then switch to server-500 and partial-data.
Then I stop backend and continue interacting.
Narration: network behavior is controlled at the interception boundary.

---

## Slide 11 - Demo Case 2 (Backend + Bypass)

Case two is Backend Endpoint with Bypass to Real API.
Now we are in honest integration mode.
Server ON means normal data.
Server OFF means request failure and backend-unreachable warning.

---

## Slide 12 - Demo Case 2 Sequence

I keep Backend Endpoint and switch to Bypass mode.
Show success while server is on.
Then stop backend, refresh, and show warning.
This proves we still preserve real integration validation.

---

## Slide 13 - Demo Case 3 (Local + Bypass)

Case three is Local API with Bypass to Real API.
When local API is enabled, it works through Next.js route handlers.
When disabled, it fails by design and warning is shown.
This is useful for simulating route unavailability directly in frontend environment.

---

## Slide 14 - Demo Case 3 Sequence

I select Local API and Bypass.
Show baseline success.
Disable Local API, refresh, show failure and warning, then enable and recover.
This is a very practical reliability demonstration.

---

## Slide 15 - Demo Case 4 (Local + MSW)

Case four is Local API with MSW Intercept.
Even when local API is disabled, MSW path keeps frontend usable for scenario-driven work.
Warning still reflects environment state, so UI is informative, not misleading.

---

## Slide 16 - Demo Case 4 Sequence

I keep Local API, switch to MSW, disable Local API, then run scenarios.
The key message is: we can continue feature work even when local route layer is intentionally unavailable.

---

## Slide 17 - Combined Demo Matrix

This matrix is the heart of the approach.
Backend + MSW is resilience mode.
Backend + Bypass is integration truth mode.
Local + Bypass validates local route path.
Local + MSW gives resilient local dev flow.

---

## Slide 18 - Transition Back to Slides

Now we’ve seen behavior in practice.
Let’s compare this approach with other tools, and where each one fits best.

---

## Slide 19 - Similar Tools Landscape

MSW is one option, not the only one.
MirageJS, json-server, Prism, WireMock, and test interceptors each solve different parts of the problem.
So tool choice should match team workflow, not hype.

---

## Slide 20 - Tool Comparison

If you need one shared dev + test network-level approach, MSW is very strong.
If you need rich in-browser data modeling, MirageJS can be great.
If you need instant endpoint bootstrap, json-server is fast.
If OpenAPI is central, Prism is useful.
If you need backend-level sophisticated stubbing, WireMock fits better.
And test interceptors are excellent for tests, but not enough for daily runtime dev flow.

---

## Slide 21 - Why We Picked MSW

We picked MSW because it intercepts at the right layer,
supports runtime switching,
and keeps frontend code path close to production integration behavior.
It solves the blocking problem without rewriting architecture.

---

## Slide 22 - Limits of MSW

We should be honest.
MSW is not a replacement for true backend integration tests.
It needs handler governance and scenario quality control.
For very stateful workflows, additional supporting tooling may be needed.

---

## Slide 23 - How We Keep It Safe

We keep real mode always available.
We unified Local API and Backend API real data source.
We show warning states in UI.
And we keep scenario list curated and intentional.

---

## Slide 24 - Adoption Plan (1 Sprint)

A realistic rollout:
Day one provider and baseline handlers,
day two scenario basics,
day three runtime controls and warning UX,
day four data-source alignment,
day five docs and onboarding checklist.
Incremental and low risk.

---

## Slide 25 - Team Process Wins

This improves FE/BE parallelization,
reduces blocked frontend tickets,
increases demo reliability,
and shortens onboarding time for new engineers.

---

## Slide 26 - Metrics You Can Track

Track concrete indicators:
blocked-by-backend tickets,
time to first interactive UI,
frontend PR cycle time,
and edge-case defects found before QA.
If these improve, the approach is paying off.

---

## Slide 27 - Anti-Patterns to Avoid

Never keep only mocked mode.
Never let scenario catalog decay.
Avoid hidden switches.
And avoid multiple unaligned data sources.
These are the fastest ways to lose trust in the setup.

---

## Slide 28 - Key Takeaways

MSW is not just a test utility; it is developer productivity infrastructure.
Keep one real integration path alive.
Make runtime state visible.
And unify real data sources to avoid drift.

---

## Slide 29 - Q&A

Thanks a lot.
If useful, I can share a runtime-control checklist, scenario template, and a phased rollout plan after the session.

