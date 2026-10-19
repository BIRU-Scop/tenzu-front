import { describe, expect, it } from "vitest";
import { EXIT_CODE, toExitCode } from "./report";
import { SchemaResult } from "./types";

describe("toOutcome", () => {
  it("returns 'drift' (exit 1) when a schema drifts", () => {
    const results: SchemaResult[] = [
      { zodSchemaName: "aSchema", kind: "conform" },
      { zodSchemaName: "bSchema", kind: "drift", drifts: [{ field: "x", severity: "HIGH", message: "…" }] },
    ];
    expect(toExitCode(results)).toBe("drift");
    expect(EXIT_CODE[toExitCode(results)]).toBe(1);
  });

  it("returns 'ok' (exit 0) when only conform/union results", () => {
    const results: SchemaResult[] = [
      { zodSchemaName: "aSchema", kind: "conform" },
      { zodSchemaName: "nSchema", kind: "union" },
    ];
    expect(toExitCode(results)).toBe("ok");
    expect(EXIT_CODE[toExitCode(results)]).toBe(0);
  });

  it("returns 'tool-error' (exit 2)", () => {
    const results: SchemaResult[] = [
      { zodSchemaName: "bSchema", kind: "drift", drifts: [{ field: "x", severity: "HIGH", message: "…" }] },
      { zodSchemaName: "cSchema", kind: "error", error: "could not load model" },
    ];
    expect(toExitCode(results)).toBe("error");
    expect(EXIT_CODE[toExitCode(results)]).toBe(2);
  });
});
