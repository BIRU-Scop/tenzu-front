import { InjectionToken } from "@angular/core";
import { BrowserSentryClientOptions } from "@micro-sentry/browser";

export const ENVIRONMENT_CONFIG = new InjectionToken("ENVIRONMENT_CONFIG");

export interface EnvironmentConfig {
  appVersion: string;
  production: boolean;
  env: "dev" | "staging" | "production";
  api: {
    prefix: string;
    baseDomain: string;
    suffixDomain: string;
    scheme: string;
  };

  sentry: BrowserSentryClientOptions;
}
