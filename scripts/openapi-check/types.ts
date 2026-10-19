/*
 * Copyright (C) 2026 BIRU
 *
 * This file is part of Tenzu.
 *
 * Tenzu is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 * You can contact BIRU at ask@biru.sh
 *
 */

/** A minimal JSON-Schema node (the subset zod's toJSONSchema and OpenAPI 3.1 produce). */
export type JsonNode = {
  type?: string | string[];
  format?: string;
  enum?: (string | number | boolean)[];
  anyOf?: JsonNode[];
  oneOf?: JsonNode[];
  properties?: Record<string, JsonNode>;
  required?: string[];
  items?: JsonNode;
  default?: unknown;
};

export type FieldDefinition = {
  types: string[];
  nullable: boolean;
  hasDefault?: boolean;
  format?: string;
  enumValues?: (string | number | boolean)[];
  object?: ObjectDefinition;
  items?: FieldDefinition;
};

export type ObjectDefinition = { fields: Record<string, FieldDefinition>; required: string[] };

export type NormalizedSchema = ({ kind: "object" } & ObjectDefinition) | { kind: "union" } | { kind: "opaque" };

export type Severity = "HIGH" | "MEDIUM";

export type FieldDrift = {
  field: string;
  severity: Severity;
  message: string;
};

export type SchemaComparison =
  | { status: "conform" }
  | { status: "drift"; drifts: FieldDrift[] }
  | { status: "union" }
  | { status: "opaque" };

export type ZodSchemaAndSerializerPairing = {
  zodSchemaAndSerializerPairs: { zodSchemaName: string; componentName: string }[];
  unmatched: string[];
};

export type SchemaResult =
  | { zodSchemaName: string; kind: "conform" }
  | { zodSchemaName: string; kind: "opaque" }
  | { zodSchemaName: string; kind: "drift"; drifts: FieldDrift[] }
  | { zodSchemaName: string; kind: "union" }
  | { zodSchemaName: string; kind: "error"; error: string };

export type ExitKey = "ok" | "drift" | "error";
