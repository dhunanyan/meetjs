import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openApiDocument } from "./openapi";

type Param = {
  in: "path" | "query" | "header";
  name: string;
  required?: boolean;
  description?: string;
  schema?: { type?: string; enum?: readonly string[] };
};

type MethodConfig = {
  summary?: string;
  description?: string;
  parameters?: readonly Param[];
  responses?: Record<
    string,
    { description?: string; content?: Record<string, { example?: unknown }> }
  >;
};

const SWAGGER_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "swagger",
);
const SWAGGER_PARTIALS_DIR = path.join(SWAGGER_DIR, "partials");
const templateCache = new Map<string, string>();

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function loadTemplate(absolutePath: string) {
  const cached = templateCache.get(absolutePath);
  if (cached) return cached;
  const next = readFileSync(absolutePath, "utf-8");
  templateCache.set(absolutePath, next);
  return next;
}

function applyReplacements(
  template: string,
  replacements: Record<string, string>,
) {
  return Object.entries(replacements).reduce(
    (output, [token, value]) => output.replaceAll(`{{${token}}}`, value),
    template,
  );
}

function renderPartial(name: string, replacements: Record<string, string>) {
  const template = loadTemplate(path.join(SWAGGER_PARTIALS_DIR, name));
  return applyReplacements(template, replacements);
}

function methodChip(method: string) {
  return renderPartial("method-chip.html", {
    TPL_METHOD_CLASS: method.toLowerCase(),
    TPL_METHOD_TEXT: method.toUpperCase(),
  });
}

function customSelectField({
  kind,
  name,
  required,
  options,
  defaultValue,
}: {
  kind: Param["in"];
  name: string;
  required?: boolean;
  options: string[];
  defaultValue: string;
}) {
  const normalized =
    !required && defaultValue === "" ? ["", ...options] : [...options];
  const initial =
    normalized.find((value) => value === defaultValue) ?? normalized[0] ?? "";
  const labelText = initial === "" ? "Not set" : initial;

  const optionMarkup = normalized
    .map((value) => {
      const isActive = value === initial;
      const display = value === "" ? "Not set" : value;
      return renderPartial("select-option.html", {
        TPL_OPTION_ACTIVE_CLASS: isActive ? "active" : "",
        TPL_OPTION_VALUE: escapeHtml(value),
        TPL_OPTION_SELECTED: isActive ? "true" : "false",
        TPL_OPTION_LABEL: escapeHtml(display),
      });
    })
    .join("");

  return renderPartial("custom-select-field.html", {
    TPL_FIELD_LABEL: `${kind} · ${escapeHtml(name)}${required ? " *" : ""}`,
    TPL_FIELD_KIND: kind,
    TPL_FIELD_NAME: escapeHtml(name),
    TPL_FIELD_VALUE: escapeHtml(initial),
    TPL_FIELD_TEXT: escapeHtml(labelText),
    TPL_FIELD_OPTIONS: optionMarkup,
  });
}

function paramCards(params: readonly Param[]) {
  if (params.length === 0) {
    return renderPartial("muted-note.html", {
      TPL_MUTED_TEXT: "No parameters for this endpoint.",
    });
  }

  const cards = params
    .map((param) =>
      renderPartial("param-card.html", {
        TPL_PARAM_NAME: escapeHtml(param.name),
        TPL_PARAM_IN: escapeHtml(param.in),
        TPL_PARAM_REQUIRED: param.required ? "required" : "optional",
        TPL_PARAM_TYPE: escapeHtml(param.schema?.type ?? "string"),
        TPL_PARAM_DESCRIPTION: escapeHtml(
          param.description ?? "No description",
        ),
      }),
    )
    .join("");

  return renderPartial("param-cards-wrap.html", {
    TPL_PARAM_CARDS: cards,
  });
}

function responsesCards(responses: Record<string, { description?: string }>) {
  const ok = Object.entries(responses).filter(
    ([status]) => Number(status) < 400,
  );
  const bad = Object.entries(responses).filter(
    ([status]) => Number(status) >= 400,
  );

  const renderGroup = (
    title: string,
    rows: [string, { description?: string }][],
    klass: string,
  ) => {
    const cards = rows
      .map(([status, info]) =>
        renderPartial("response-card.html", {
          TPL_RESPONSE_CLASS: klass,
          TPL_RESPONSE_STATUS: escapeHtml(status),
          TPL_RESPONSE_DESCRIPTION: escapeHtml(
            info.description ?? "No description",
          ),
        }),
      )
      .join("");

    return renderPartial("responses-group.html", {
      TPL_RESPONSES_TITLE: title,
      TPL_RESPONSE_CARDS: cards,
    });
  };

  return renderPartial("responses-wrap.html", {
    TPL_RESPONSE_GROUPS:
      (ok.length ? renderGroup("Success Responses", ok, "ok") : "") +
      (bad.length ? renderGroup("Handled Error Responses", bad, "err") : ""),
  });
}

function tryInputs(pathname: string, params: readonly Param[]) {
  const pathWithId = pathname.replace("{id}", "INC-5300");

  const fields = params
    .map((param) => {
      const defaultValue =
        param.name === "id"
          ? "INC-5300"
          : param.name === "scenario"
            ? "happy-path"
            : "";
      const placeholder =
        param.name === "scenario"
          ? "happy-path | slow-3s | server-500 | ..."
          : param.name.startsWith("x-")
            ? "true / false / value"
            : "value";
      const enumValues = param.schema?.enum ?? [];
      const isBoolean = param.schema?.type === "boolean";

      if (enumValues.length > 0) {
        return customSelectField({
          kind: param.in,
          name: param.name,
          required: param.required,
          options: [...enumValues],
          defaultValue,
        });
      }

      if (isBoolean) {
        return customSelectField({
          kind: param.in,
          name: param.name,
          required: param.required,
          options: ["true", "false"],
          defaultValue,
        });
      }

      return renderPartial("input-field.html", {
        TPL_INPUT_LABEL: `${param.in} · ${escapeHtml(param.name)}${param.required ? " *" : ""}`,
        TPL_INPUT_KIND: param.in,
        TPL_INPUT_NAME: escapeHtml(param.name),
        TPL_INPUT_VALUE: escapeHtml(defaultValue),
        TPL_INPUT_PLACEHOLDER: escapeHtml(placeholder),
      });
    })
    .join("");

  return renderPartial("try-section.html", {
    TPL_TRY_PATH: escapeHtml(pathWithId),
    TPL_TRY_FIELDS:
      fields ||
      renderPartial("muted-note.html", {
        TPL_MUTED_TEXT: "No inputs required.",
      }),
    TPL_TRY_PARAMS: paramCards(params),
  });
}

function endpointDetails(
  pathname: string,
  method: string,
  config: MethodConfig,
) {
  const params = config.parameters ?? [];
  const responses = config.responses ?? {};
  const example = Object.values(responses).find((r) => r.content)?.content?.[
    "application/json"
  ]?.example;

  const exampleMarkup = example
    ? renderPartial("endpoint-example.html", {
        TPL_EXAMPLE_JSON: escapeHtml(JSON.stringify(example, null, 2)),
      })
    : "";

  return renderPartial("endpoint-details.html", {
    TPL_ENDPOINT_METHOD_CHIP: methodChip(method),
    TPL_ENDPOINT_PATH: escapeHtml(pathname),
    TPL_ENDPOINT_SUMMARY: escapeHtml(config.summary ?? ""),
    TPL_ENDPOINT_DESCRIPTION: escapeHtml(config.description ?? ""),
    TPL_ENDPOINT_TRY: tryInputs(pathname, params),
    TPL_ENDPOINT_RESPONSES: responsesCards(responses),
    TPL_ENDPOINT_EXAMPLE: exampleMarkup,
  });
}

function endpointsHtml() {
  return Object.entries(openApiDocument.paths)
    .map(([pathKey, methods]) =>
      Object.entries(methods as unknown as Record<string, MethodConfig>)
        .map(([method, config]) => endpointDetails(pathKey, method, config))
        .join(""),
    )
    .join("");
}

export function buildSwaggerPage() {
  const template = loadTemplate(path.join(SWAGGER_DIR, "index.html"));
  const style = loadTemplate(path.join(SWAGGER_DIR, "style.css"));
  const scriptFile = ["main.js", "script.js"]
    .map((name) => path.join(SWAGGER_DIR, name))
    .find((filePath) => existsSync(filePath));
  const script = scriptFile ? loadTemplate(scriptFile) : "";

  return applyReplacements(template, {
    TPL_PAGE_TITLE: "Demo API Docs",
    TPL_FAVICON_URL: "https://dhunanyan.com/favicon.ico",
    TPL_HEADER_TITLE: "Demo Backend API Docs",
    TPL_HEADER_SUBTITLE:
      "Custom Swagger-style docs with interactive requests and detailed endpoint behavior.",
    TPL_BADGE: "OpenAPI 3.0",
    TPL_SPEC_LABEL: "Spec endpoint",
    TPL_SPEC_HREF: "/openapi.json",
    TPL_SPEC_TEXT: "/openapi.json",
    TPL_ENDPOINTS: endpointsHtml(),
    TPL_STYLE_CONTENT: `<style>${style}</style>`,
    TPL_SCRIPT_CONTENT: `<script>${script}</script>`,
  });
}
