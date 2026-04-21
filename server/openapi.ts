export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "MeetJS Demo Backend API",
    version: "1.0.0",
    description: "Node backend used by the MSW demo project.",
  },
  servers: [{ url: "http://localhost:8787" }],
  paths: {
    "/api/meta": {
      get: {
        summary: "Get scenario catalog",
        description: "Returns available scenario values used by dashboard requests.",
        responses: {
          "200": {
            description: "Scenario list",
            content: {
              "application/json": {
                example: {
                  scenarios: [
                    { value: "happy-path", label: "Happy Path", hint: "Stable baseline responses" },
                    { value: "server-500", label: "Server 500", hint: "Backend error fallback" },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/dashboard": {
      get: {
        summary: "Get dashboard payload",
        description: "Returns incidents, releases, health metrics, and summary counters.",
        responses: {
          "200": {
            description: "Dashboard payload",
            content: {
              "application/json": {
                example: {
                  summary: { total: 55, open: 19, blocked: 9, doneToday: 8, affectedUsers: 21403 },
                  issues: [{ id: "INC-5300", title: "Checkout submit disabled after 2FA modal close", status: "open" }],
                  releases: [{ id: "REL-1202", result: "warning" }],
                  health: [{ name: "Error rate", value: "2.1%", trend: "up" }],
                },
              },
            },
          },
        },
      },
    },
    "/api/issues/{id}/resolve": {
      post: {
        summary: "Resolve issue by id",
        description: "Marks an issue as done and recalculates summary counters.",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
            description: "Issue identifier, e.g. INC-5300",
          },
        ],
        responses: {
          "200": {
            description: "Issue resolved",
            content: {
              "application/json": {
                example: {
                  ok: true,
                  issue: { id: "INC-5300", status: "done", usersImpacted: 0 },
                },
              },
            },
          },
          "404": { description: "Issue not found" },
        },
      },
    },
  },
} as const;
