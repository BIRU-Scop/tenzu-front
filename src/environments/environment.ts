import { EnvironmentConfig } from "./environment-type";

export const environment: EnvironmentConfig = {
  appVersion: "dev",
  production: false,
  env: "dev",
  api: {
    prefix: "v2",
    baseDomain: "local-tenzu.biru.ovh",
    suffixDomain: "api",
    scheme: "https",
  },
  sentry: {},
};
