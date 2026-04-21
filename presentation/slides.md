% MSW Beyond Tests
% Develop Frontend Without Waiting for Backend
% Meet.js Poland

# MSW Beyond Tests

Develop Frontend Without Waiting for Backend

![MSW](public/logos/msw.svg){width=1in}
![Next.js](public/logos/next.svg){width=1in}

---

# Who This Talk Is For

- Frontend engineers blocked by missing or unstable backend
- Teams shipping UI in parallel with backend development
- Developers who want realistic scenarios, not fake component-only mocks

---

# The Core Problem

- Endpoint not ready this sprint
- Shared nonprod unstable or rate-limited
- Contract changes mid-feature
- Frontend PRs blocked by environment issues

---

# What Usually Goes Wrong

- Hardcoded JSON in components
- Different mock sources in dev/tests/stories
- Mock shape drifts from real API shape
- Integration confidence appears too late

---

# Target State

- One real integration path is always available
- Mocking happens at network boundary
- Runtime switch between real and mocked responses
- Clear UI warnings for system state

---

# Live Demo Block (Now We Jump to the App)

In the next section, we switch to the demo project and validate all runtime combinations.

What audience should watch:

- API Target selection
- Data Source selection
- Scenario behavior
- Server ON/OFF effect
- Local API enable/disable effect

---

# Runtime Controls Used in Demo

- **API Target**
  - Local API (`/api`)
  - Backend Endpoint (`localhost:8787`)

- **Data Source**
  - MSW Intercept
  - Bypass to Real API

- **Local API Toggle**
  - Enable/Disable Local API button

- **Refresh**
  - Manual refresh only

---

# Scenario Catalog Used in Demo

- `happy-path`
- `slow-3s`
- `server-500`
- `network-error`
- `auth-expired`
- `partial-data`
- `contract-drift`
- `flaky`

Note:
- In current UX, scenario selection is meaningful in MSW mode.
- In Bypass mode, Scenario control is intentionally disabled.

---

# Demo Case 1

## Backend Endpoint + MSW Intercept

- Backend server **ON**
  - UI still uses MSW responses (server status does not block flow)
- Backend server **OFF**
  - UI continues through MSW
  - Backend warning may still show for observability

Use this case to prove: **frontend is unblocked even when backend is down**.

---

# Demo Case 1 - Suggested Sequence

1. Select `Backend Endpoint`
2. Select `MSW Intercept`
3. Show `happy-path`
4. Switch to `server-500` and `partial-data`
5. Stop backend process
6. Keep interacting successfully

Narration line:
"Network behavior is controlled at MSW boundary, so backend outage does not block development."

---

# Demo Case 2

## Backend Endpoint + Bypass to Real API

- Backend server **ON**
  - Real responses load normally
- Backend server **OFF**
  - Request fails
  - Backend unreachable warning appears

Use this case to prove: **real integration path is still available and honest**.

---

# Demo Case 2 - Suggested Sequence

1. Keep `Backend Endpoint`
2. Switch to `Bypass to Real API`
3. Show successful load with server ON
4. Stop backend
5. Click refresh -> show failure + warning

Narration line:
"This is our reality check mode: no mocking, real integration only."

---

# Demo Case 3

## Local API (`/api`) + Bypass to Real API

- Local API **Enabled**
  - Works via Next.js route handlers
- Local API **Disabled**
  - Fails by design
  - Local API disabled warning appears

Use this case to prove: **local fallback can be controlled explicitly during demo/dev**.

---

# Demo Case 3 - Suggested Sequence

1. Select `Local API (/api)`
2. Select `Bypass to Real API`
3. Show baseline success
4. Click `Disable Local API`
5. Refresh -> show failure + local warning
6. Re-enable and recover

Narration line:
"We can intentionally simulate unavailable local routes without touching backend."

---

# Demo Case 4

## Local API (`/api`) + MSW Intercept

- Local API **Enabled**
  - MSW responses are used
- Local API **Disabled**
  - UI can still continue through MSW intercept path
  - Local warning is visible as environment state

Use this case to prove: **MSW can isolate frontend progress from local route availability too**.

---

# Demo Case 4 - Suggested Sequence

1. Keep `Local API (/api)`
2. Switch to `MSW Intercept`
3. Toggle `Disable Local API`
4. Show MSW scenarios still working
5. Call out warning as informative signal

Narration line:
"Even when local route layer is disabled, we can continue scenario-driven frontend development."

---

# Combined Demo Matrix (Quick Reference)

- Backend + MSW -> resilient workflow, backend-independent
- Backend + Bypass -> true integration validation
- Local + Bypass -> local route behavior validation
- Local + MSW -> resilient local dev flow

This matrix is the heart of the talk.

---

# Transition Back to Slides

After live demo, return with one sentence:

"Now we saw the runtime behavior in practice, let’s compare this approach to other tooling options and tradeoffs."

---

# Similar Tools: Landscape Overview

- **MSW**: network interception in browser/node; app-level realism
- **MirageJS**: in-browser mock server with models/routes
- **json-server**: quick REST server from JSON file
- **Prism**: OpenAPI-driven mock server
- **WireMock**: powerful HTTP stubbing/recording server
- **Playwright/Cypress intercept**: test-scoped route stubbing

---

# Tool Comparison (When to Use What)

- **MSW**: shared dev + tests with same handlers
- **MirageJS**: rich in-browser data modeling
- **json-server**: fastest endpoint bootstrap
- **Prism**: spec-driven mock from OpenAPI
- **WireMock**: backend-level integration stubs
- **Test interceptors**: isolated test control, not dev runtime

---

# Why We Picked MSW Here

- Works at network layer, not component layer
- Runtime switching is simple for demos
- Keeps frontend code path close to production integration
- Supports scenario-driven reliability checks

---

# Limits of MSW (Be Honest)

- Does not replace full backend integration testing
- Needs governance to prevent handler drift
- Very stateful workflows may need additional support
- Teams must maintain scenario quality

---

# How We Keep It Safe

- Real mode always available
- Shared real data source for Local API + Backend API
- Warning states are visible in UI
- Scenario list is intentional and curated

---

# Adoption Plan (1 Sprint)

- Day 1: provider + baseline handlers
- Day 2: key scenarios (500/network/auth)
- Day 3: runtime controls + warning UX
- Day 4: unify real data source
- Day 5: docs + onboarding checklist

---

# Team Process Wins

- FE/BE parallelization improves
- Fewer blocked frontend tickets
- More stable demos for stakeholders
- Faster onboarding for new team members

---

# Metrics You Can Track

- "Blocked by backend" ticket count
- Time to first interactive feature UI
- Frontend PR cycle time
- Edge-case defects caught before QA

---

# Anti-Patterns to Avoid

- Keeping only mocked mode, never validating real mode
- Unmaintained scenario catalog
- Hidden environment switches
- Multiple unaligned data sources

---

# Key Takeaways

- MSW is a developer productivity layer, not only test utility
- Keep one real integration path alive
- Make runtime state obvious in UI
- Use shared real data to avoid drift

---

# Q&A

If you want, I can share:

- runtime control checklist
- scenario design template
- rollout plan for your team

Thank you

