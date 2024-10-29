import { EnvironmentConfig } from "./environment-type";

export const environment: EnvironmentConfig = {
  appVersion: "$RELEASE_VERSION",
  production: true,
  env: "production",
  api: {
    prefix: "v2",
    baseDomain: "$BASE_DOMAIN",
    suffixDomain: "api",
    scheme: "https",
  },
  sentry: {
    dsn: "$SENTRY_DSN",
    environment: "$SENTRY_ENVIRONMENT",
    release: "$RELEASE_VERSION",
  },
};
