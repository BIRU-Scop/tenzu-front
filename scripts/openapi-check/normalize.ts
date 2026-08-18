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

import { FieldDefinition, JsonNode, NormalizedSchema, ObjectDefinition } from "./types";

const MAX_DEPTH = 2;

export function normalize(schema: JsonNode): NormalizedSchema {
  if (schema.anyOf || schema.oneOf) {
    return { kind: "union" };
  }
  if (schema.type !== "object" || !schema.properties) {
    return { kind: "opaque" };
  }
  const fields: Record<string, FieldDefinition> = {};
  for (const [name, node] of Object.entries(schema.properties)) {
    fields[name] = normalizeField(node);
  }
  return { kind: "object", fields, required: schema.required ?? [] };
}

export function normalizeField(node: JsonNode, depth = 0): FieldDefinition {
  const variants: JsonNode[] = node.anyOf ?? node.oneOf ?? [node];
  const types: string[] = [];
  let nullable = false;
  let format: string | undefined;
  let enumValues: (string | number | boolean)[] | undefined;

  for (const variant of variants) {
    const variantTypes = Array.isArray(variant.type) ? variant.type : variant.type ? [variant.type] : [];
    for (const variantType of variantTypes) {
      if (variantType === "null") {
        nullable = true;
      } else {
        types.push(variantType);
      }
    }
    if (variant.format !== undefined) {
      format = variant.format;
    }
    if (variant.enum !== undefined) {
      enumValues = variant.enum;
    }
  }
  if (node.enum !== undefined && enumValues === undefined) {
    enumValues = node.enum;
  }

  const hasDefault = node.default !== undefined || variants.some((variant) => variant.default !== undefined);

  let object: ObjectDefinition | undefined;
  let items: FieldDefinition | undefined;
  if (depth < MAX_DEPTH) {
    const objectVariant = variants.find((variant) => variant.properties !== undefined);
    if (objectVariant?.properties) {
      const nestedFields: Record<string, FieldDefinition> = {};
      for (const [name, child] of Object.entries(objectVariant.properties)) {
        nestedFields[name] = normalizeField(child, depth + 1);
      }
      object = { fields: nestedFields, required: objectVariant.required ?? [] };
    }
    const arrayVariant = variants.find((variant) => variant.items !== undefined);
    if (arrayVariant?.items) {
      const element = normalizeField(arrayVariant.items, depth + 1);
      if (element.object) {
        items = element;
      }
    }
  }

  return {
    types: [...new Set(types)],
    nullable,
    ...(hasDefault ? { hasDefault: true } : {}),
    ...(format !== undefined ? { format } : {}),
    ...(enumValues !== undefined ? { enumValues } : {}),
    ...(object ? { object } : {}),
    ...(items ? { items } : {}),
  };
}
