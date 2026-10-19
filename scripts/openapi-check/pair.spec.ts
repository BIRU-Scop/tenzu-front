import { describe, expect, it } from "vitest";
import { getNameSerializer, pairZodAndSerializer } from "./pair-zod-and-serializer";

describe("getNameSerializer", () => {
  it("offers the bare and Serializer-suffixed names, most-specific first", () => {
    expect(getNameSerializer("projectSummarySchema")).toEqual(["ProjectSummary", "ProjectSummarySerializer"]);
    expect(getNameSerializer("roleSchema")).toEqual(["Role", "RoleSerializer"]);
  });
});

describe("pairZodAndSerializer", () => {
  it("matches the bare component name when present", () => {
    const result = pairZodAndSerializer(
      ["importationStatusSchema"],
      ["ImportationStatusSerializer", "OtherSerializer"],
    );
    expect(result.zodSchemaAndSerializerPairs).toEqual([
      { zodSchemaName: "importationStatusSchema", componentName: "ImportationStatusSerializer" },
    ]);
  });

  it("falls back to the <X>Serializer component name", () => {
    const result = pairZodAndSerializer(
      ["projectSummarySchema", "roleSchema"],
      ["ProjectSummarySerializer", "RoleSerializer"],
    );
    expect(result.zodSchemaAndSerializerPairs).toEqual([
      { zodSchemaName: "projectSummarySchema", componentName: "ProjectSummarySerializer" },
      { zodSchemaName: "roleSchema", componentName: "RoleSerializer" },
    ]);
    expect(result.unmatched).toEqual([]);
  });

  it("lists schemas without any matching candidate", () => {
    const result = pairZodAndSerializer(["membershipBaseSchema"], ["ProjectSummarySerializer"]);
    expect(result.zodSchemaAndSerializerPairs).toEqual([]);
    expect(result.unmatched).toEqual(["membershipBaseSchema"]);
  });
});
