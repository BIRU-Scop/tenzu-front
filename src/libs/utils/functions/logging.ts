import { isDevMode } from "@angular/core";

export function debug(type: string, message: string, data?: unknown): void {
  if (isDevMode()) {
    const date = new Date();
    console.debug(
      `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()})  [${type}] ${message}`,
      data || "",
    );
  }
}
