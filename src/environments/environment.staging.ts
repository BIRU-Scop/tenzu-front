import { EnvironmentConfig } from "./environment-type"; // Included with Angular CLI.
export const environment: EnvironmentConfig = {
  appVersion: "$RELEASE_VERSION",
  production: true,
  env: "staging",
  api: {
    prefix: "v2",
    baseDomain: "$BASE_DOMAIN",
    suffixDomain: "api",
    scheme: "https",
  },
  sentry: {
    dsn: "$SENTRY_DSN",
    environment: "staging",
    release: "$RELEASE_VERSION",
  },
};
