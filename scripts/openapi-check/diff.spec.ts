import { describe, expect, it } from "vitest";
import { diff } from "./diff";
import { NormalizedSchema } from "./types";

describe("diff", () => {
  it("flags a backend-required field missing in zod as HIGH", () => {
    const zod: NormalizedSchema = { kind: "object", fields: {}, required: [] };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: { modifiedAt: { types: ["string"], nullable: true, format: "date-time" } },
      required: ["modifiedAt"],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts).toHaveLength(1);
    expect(result.drifts[0]).toMatchObject({ field: "modifiedAt", severity: "HIGH" });
  });

  it("flags integer (backend) vs number (zod) as MEDIUM", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: { color: { types: ["number"], nullable: false } },
      required: ["color"],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: { color: { types: ["integer"], nullable: false } },
      required: ["color"],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts).toEqual([expect.objectContaining({ field: "color", severity: "MEDIUM" })]);
  });

  it("projectSummarySchema vs ProjectSummary → modifiedAt HIGH, color MEDIUM", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: {
        id: { types: ["string"], nullable: false },
        workspaceId: { types: ["string"], nullable: false },
        name: { types: ["string"], nullable: false },
        slug: { types: ["string"], nullable: false },
        landingPage: { types: ["string"], nullable: false },
        logo: { types: ["string"], nullable: true },
        description: { types: ["string"], nullable: false },
        color: { types: ["number"], nullable: false },
        userIsInvited: { types: ["boolean"], nullable: false },
      },
      required: ["id", "workspaceId", "name", "slug", "landingPage", "description", "color", "userIsInvited"],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: {
        id: { types: ["string"], nullable: false },
        workspaceId: { types: ["string"], nullable: false },
        name: { types: ["string"], nullable: false },
        slug: { types: ["string"], nullable: false },
        landingPage: { types: ["string"], nullable: false },
        logo: { types: ["string"], nullable: true },
        description: { types: ["string"], nullable: false },
        color: { types: ["integer"], nullable: false },
        modifiedAt: { types: ["string"], nullable: true, format: "date-time" },
        userIsInvited: { types: ["boolean"], nullable: false },
      },
      required: [
        "id",
        "workspaceId",
        "name",
        "slug",
        "landingPage",
        "description",
        "color",
        "modifiedAt",
        "userIsInvited",
      ],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts.map((d) => ({ field: d.field, severity: d.severity }))).toEqual([
      { field: "color", severity: "MEDIUM" },
      { field: "modifiedAt", severity: "HIGH" },
    ]);
  });

  it("reports no drift for identical schemas", () => {
    const s: NormalizedSchema = {
      kind: "object",
      fields: { a: { types: ["string"], nullable: false } },
      required: ["a"],
    };
    expect(diff(s, s)).toEqual({ status: "conform" });
  });

  it("defers unions to manual review", () => {
    const union: NormalizedSchema = { kind: "union" };
    const obj: NormalizedSchema = { kind: "object", fields: {}, required: [] };
    expect(diff(union, obj)).toEqual({ status: "union" });
    expect(diff(obj, union)).toEqual({ status: "union" });
  });

  it("does not flag a required-in-zod field when the backend field carries a default", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: { foo: { types: ["array"], nullable: false } },
      required: ["foo"],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: { foo: { types: ["array"], nullable: false, hasDefault: true } },
      required: [],
    };
    expect(diff(zod, backend)).toEqual({ status: "conform" });
  });

  it("still flags a required-in-zod field that is optional AND has no backend default as HIGH", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: { foo: { types: ["string"], nullable: false } },
      required: ["foo"],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: { foo: { types: ["string"], nullable: false } },
      required: [],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts).toEqual([expect.objectContaining({ field: "foo", severity: "HIGH" })]);
  });

  it("recurses into a nested object and flags a missing nested field with a dotted path", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: {
        createdBy: {
          types: ["object"],
          nullable: true,
          object: { fields: { username: { types: ["string"], nullable: false } }, required: ["username"] },
        },
      },
      required: [],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: {
        createdBy: {
          types: ["object"],
          nullable: true,
          object: {
            fields: { id: { types: ["string"], nullable: false }, username: { types: ["string"], nullable: false } },
            required: ["id", "username"],
          },
        },
      },
      required: [],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts).toEqual([expect.objectContaining({ field: "createdBy.id", severity: "HIGH" })]);
  });

  it("recurses into array-of-object elements with a [] path", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: {
        members: {
          types: ["array"],
          nullable: false,
          items: {
            types: ["object"],
            nullable: false,
            object: { fields: { name: { types: ["string"], nullable: false } }, required: ["name"] },
          },
        },
      },
      required: ["members"],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: {
        members: {
          types: ["array"],
          nullable: false,
          items: {
            types: ["object"],
            nullable: false,
            object: {
              fields: { id: { types: ["string"], nullable: false }, name: { types: ["string"], nullable: false } },
              required: ["id", "name"],
            },
          },
        },
      },
      required: ["members"],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts).toEqual([expect.objectContaining({ field: "members[].id", severity: "HIGH" })]);
  });

  it("ignores under-specified (untyped) backend fields", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: { id: { types: ["string"], nullable: false } },
      required: ["id"],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: { id: { types: [], nullable: false } },
      required: ["id"],
    };
    expect(diff(zod, backend)).toEqual({ status: "conform" });
  });

  it("detect drift in enum values", () => {
    const zod: NormalizedSchema = {
      kind: "object",
      fields: { status: { types: ["integer"], nullable: false, enumValues: [2, 3, 4] } },
      required: [],
    };
    const backend: NormalizedSchema = {
      kind: "object",
      fields: { status: { types: ["integer"], nullable: false, enumValues: [1, 2, 3] } },
      required: [],
    };
    const result = diff(zod, backend);
    expect(result.status).toBe("drift");
    if (result.status !== "drift") return;
    expect(result.drifts).toEqual([
      expect.objectContaining({ field: "status", severity: "HIGH" }),
      expect.objectContaining({ field: "status", severity: "MEDIUM" }),
    ]);
  });
});
