import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { isZodSchema } from "./is-zod-schema";

describe("isZodSchema", () => {
  it("recognises a zod schema and rejects other exports", () => {
    expect(isZodSchema(z.object({ a: z.string() }))).toBe(true);
    expect(isZodSchema(z.string())).toBe(true);
    expect(isZodSchema(42)).toBe(false);
    expect(isZodSchema(() => undefined)).toBe(false);
    expect(isZodSchema({ parse: () => undefined })).toBe(false);
    expect(isZodSchema(undefined)).toBe(false);
  });
});
