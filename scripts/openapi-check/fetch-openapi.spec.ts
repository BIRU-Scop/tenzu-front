import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOpenApi } from "./fetch-openapi";

function stubFetch(response: Response): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => response),
  );
}

describe("fetchOpenApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns components.schemas with internal $ref dereferenced", async () => {
    const doc = {
      openapi: "3.1.0",
      components: {
        schemas: {
          Role: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
          ProjectRole: {
            type: "object",
            properties: { role: { $ref: "#/components/schemas/Role" } },
          },
        },
      },
    };
    stubFetch(new Response(JSON.stringify(doc), { status: 200 }));

    const components = await fetchOpenApi("https://example.test/openapi.json");

    expect(Object.keys(components)).toEqual(["Role", "ProjectRole"]);
    expect((components["ProjectRole"].properties?.["role"] as { type?: string }).type).toBe("object");
  });

});
