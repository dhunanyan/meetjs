# MSW Beyond Tests
## Develop Frontend Without Waiting for Backend
### 15-minute talk deck (Meet.js)

---

## Slide 1 - Title

**MSW Beyond Tests: Develop Frontend Without Waiting for Backend**

- Your Name
- Meet.js, Poland
- Stack: Next.js App Router + Local API + Node API + MSW

**Speaker cue (30s):**
- Set expectation: this is not a QA talk.
- It is about developer flow, unblocking frontend delivery, and realistic integration practice.

---

## Slide 2 - The Real Problem

**What blocks frontend teams most often?**

- Backend endpoint not ready
- Backend unstable on shared env
- Contract keeps changing
- Feature work waits on network dependencies

**Key point:**
Frontend teams need a reliable way to keep shipping when backend is unavailable.

**Speaker cue (1m):**
- Use a real example from your project.
- Emphasize "we don’t want fake demos, we want productive delivery".

---

## Slide 3 - Wrong vs Right Approaches

**Common anti-patterns**

- Hardcoded JSON in components
- Multiple disconnected mock sources
- Mock-only code path that diverges from real API shape

**Better approach**

- Keep one real contract path
- Use MSW at network boundary
- Switch behavior at runtime for demos/dev workflows

**Speaker cue (1m):**
- Highlight that mocking should not mean "mock everything forever".

---

## Slide 4 - Demo Architecture

**In this demo app we have 3 data layers:**

1. **Node API** (`localhost:8787`) - real backend simulation
2. **Local API** (`/api`) - app-router fallback route layer
3. **MSW Intercept** - runtime network interception

**Important:**
- Local API + Node API share one JSON source (`db/dashboard.json`)
- MSW can return scenario variants

**Speaker cue (1m 30s):**
- Clarify that real sources are unified to avoid drift.
- MSW is for behavior simulation, not replacing architecture.

---

## Slide 5 - Runtime Controls (What audience should notice)

**Sidebar controls:**

- API Target: `Local API` or `Backend Endpoint`
- Data Source: `MSW Intercept` or `Bypass to Real API`
- Runtime local API disable toggle
- Manual refresh only

**Why this matters:**
- You can show behavior changes live without redeploying anything.

**Speaker cue (1m):**
- Tell audience exactly what they should watch in the UI.

---

## Slide 6 - The Four Modes (Core Demo Matrix)

1. Local API + Bypass Real
2. Local API + MSW Intercept
3. Backend Endpoint + Bypass Real
4. Backend Endpoint + MSW Intercept

**Message:**
- Same frontend can run against real endpoints or mocked network responses instantly.

**Speaker cue (1m 30s):**
- Walk through the matrix quickly before live clicking.

---

## Slide 7 - Failure Signals & Safety UX

**Built-in warnings in UI:**

- `Local /api is disabled from runtime control.`
- `Backend endpoint is unreachable ... localhost:8787`

**Result:**
- Demo can explain system state, not just break silently.

**Speaker cue (1m):**
- Mention this is critical for onboarding and pair-debug sessions.

---

## Slide 8 - What MSW Gives Developers (Not only tests)

**Developer-focused wins:**

- Build screens before backend is ready
- Reproduce edge cases on demand
- Validate loading/error/contract-drift behavior
- Reduce blocked PRs

**Not a replacement for backend:**
- Still keep integration path with real API.

**Speaker cue (1m):**
- Reframe MSW as productivity infrastructure.

---

## Slide 9 - Why We Unified Real Data Source

**Before:**
- Local API and Node API had separate hardcoded data

**After:**
- Shared `db/dashboard.json`
- Shared helper for DB clone + summary recompute

**Outcome:**
- Local API and backend endpoint stay consistent
- Demo comparisons are fair

**Speaker cue (1m):**
- This is where credibility improves in tech talks.

---

## Slide 10 - Live Demo Flow (Recommended)

1. Start with Backend + Real (happy baseline)
2. Stop backend -> show backend warning
3. Switch to MSW Intercept -> app still works
4. Switch scenarios (500/network/auth/partial/contract drift)
5. Return to Real -> show integration path again

**Speaker cue (2m):**
- Keep keyboard/mouse moves intentional and narrate each switch.

---

## Slide 11 - Practical Adoption Plan

**How teams can adopt in 1 sprint:**

- Day 1: Introduce MSW provider + basic handlers
- Day 2-3: Add high-value scenarios (500/auth/network)
- Day 4: Add runtime toggles for dev
- Day 5: Align real data seed and clean warnings

**Speaker cue (1m):**
- Audience leaves with concrete next steps.

---

## Slide 12 - Takeaways

- Use MSW as a **developer unblocker**, not only test utility
- Keep a **real integration path** available
- Keep **real API data sources unified**
- Make runtime state visible with clear warnings

**Thank you**
- Q&A

**Speaker cue (30s):**
- End with: "You can adopt this incrementally, no big rewrite needed."

---

## Timing Plan (15 min)

- Slides 1-3: 2:30
- Slides 4-6: 4:00
- Slides 7-10: 6:30
- Slides 11-12 + Q&A transition: 2:00

