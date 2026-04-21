export type ServerConfig = {
  appName: string;
  appEnv: string;
  appVersion: string;
  host: string;
  port: number;
  corsOrigin: string;
  swaggerEnabled: boolean;
};

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === "true";
}

export function getServerConfig(): ServerConfig {
  return {
    appName: process.env.APP_NAME || "MeetJS MSW Demo",
    appEnv: process.env.APP_ENV || process.env.NODE_ENV || "development",
    appVersion: process.env.APP_VERSION || "0.0.0-dev",
    host: process.env.SERVER_HOST || "0.0.0.0",
    port: toNumber(process.env.SERVER_PORT || process.env.PORT, 8787),
    corsOrigin: process.env.SERVER_CORS_ORIGIN || "*",
    swaggerEnabled: toBoolean(process.env.SERVER_SWAGGER_ENABLED, true),
  };
}
