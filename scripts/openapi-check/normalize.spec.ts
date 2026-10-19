import { describe, expect, it } from "vitest";
import { normalize, normalizeField } from "./normalize";

describe("normalizeField", () => {
  it("unifies both nullable representations", () => {
    const openapi31 = normalizeField({ type: ["string", "null"] });
    const zodStyle = normalizeField({ anyOf: [{ type: "string" }, { type: "null" }] });
    expect(openapi31).toEqual({ types: ["string"], nullable: true });
    expect(zodStyle).toEqual({ types: ["string"], nullable: true });
  });

  it("captures format, integer, and enum values", () => {
    expect(normalizeField({ type: "string", format: "date-time" })).toEqual({
      types: ["string"],
      nullable: false,
      format: "date-time",
    });
    expect(normalizeField({ type: "integer" })).toEqual({ types: ["integer"], nullable: false });
    expect(normalizeField({ enum: ["a", "b"] })).toEqual({ types: [], nullable: false, enumValues: ["a", "b"] });
  });

  it("flags a backend default via hasDefault", () => {
    expect(normalizeField({ type: "array", items: { type: "string" }, default: [] })).toEqual({
      types: ["array"],
      nullable: false,
      hasDefault: true,
    });
    expect(normalizeField({ type: "array", items: { type: "string" } })).toEqual({ types: ["array"], nullable: false });
  });

  it("recurses into a nested object (its fields + required)", () => {
    expect(normalizeField({ type: "object", properties: { id: { type: "string" } }, required: ["id"] })).toEqual({
      types: ["object"],
      nullable: false,
      object: { fields: { id: { types: ["string"], nullable: false } }, required: ["id"] },
    });
  });

  it("recurses into the non-null variant of a nullable object", () => {
    expect(
      normalizeField({
        anyOf: [{ type: "object", properties: { id: { type: "string" } }, required: ["id"] }, { type: "null" }],
      }),
    ).toEqual({
      types: ["object"],
      nullable: true,
      object: { fields: { id: { types: ["string"], nullable: false } }, required: ["id"] },
    });
  });

  it("recurses into array-of-object elements", () => {
    expect(
      normalizeField({
        type: "array",
        items: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
      }),
    ).toEqual({
      types: ["array"],
      nullable: false,
      items: {
        types: ["object"],
        nullable: false,
        object: { fields: { id: { types: ["string"], nullable: false } }, required: ["id"] },
      },
    });
    expect(normalizeField({ type: "array", items: { type: "string" } })).toEqual({ types: ["array"], nullable: false });
  });
});

describe("normalize", () => {
  it("returns an object with per-field shapes and the required list", () => {
    const result = normalize({
      type: "object",
      properties: { name: { type: "string" }, color: { type: "integer" } },
      required: ["name"],
    });
    expect(result).toEqual({
      kind: "object",
      fields: {
        name: { types: ["string"], nullable: false },
        color: { types: ["integer"], nullable: false },
      },
      required: ["name"],
    });
  });

  it("flags a top-level union", () => {
    expect(normalize({ oneOf: [{ type: "object" }, { type: "object" }] })).toEqual({ kind: "union" });
  });
});
