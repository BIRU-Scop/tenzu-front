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

import { FieldDrift, FieldDefinition, NormalizedSchema, ObjectDefinition, SchemaComparison } from "./types";

export function diff(zodSchema: NormalizedSchema, serializerOpenApi: NormalizedSchema): SchemaComparison {
  if (zodSchema.kind === "union" || serializerOpenApi.kind === "union") {
    return { status: "union" };
  }

  if (zodSchema.kind !== "object" || serializerOpenApi.kind !== "object") {
    return { status: "opaque" };
  }

  const drifts: FieldDrift[] = [];
  diffObject(zodSchema, serializerOpenApi, "", drifts);
  return drifts.length ? { status: "drift", drifts } : { status: "conform" };
}

function diffObject(
  zodObject: ObjectDefinition,
  serializerObject: ObjectDefinition,
  prefix: string,
  drifts: FieldDrift[],
): void {
  const zodRequiredFieldName = new Set(zodObject.required);
  const serializerRequiredFieldName = new Set(serializerObject.required);
  const fields = new Set([...Object.keys(serializerObject.fields), ...Object.keys(zodObject.fields)]);

  for (const field of [...fields].sort()) {
    const path = `${prefix}${field}`;
    const serializerField = serializerObject.fields[field];
    const zodField = zodObject.fields[field];

    if (serializerField && !zodField) {
      const required = serializerRequiredFieldName.has(field);
      drifts.push({
        field: path,
        severity: required ? "HIGH" : "MEDIUM",
        message: `missing on the zod side (backend: ${describe(serializerField)}${required ? ", required" : ", optional"})`,
      });
      continue;
    }
    if (zodField && !serializerField) {
      drifts.push({ field: path, severity: "HIGH", message: `present in zod but absent from the backend` });
      continue;
    }
    if (!serializerField || !zodField) continue;

    if (serializerField.types.length === 0) continue;

    // required/optional. A backend `default` guarantees the field is always emitted in a response,
    // so a required-in-zod field cannot fail to parse — not a drift despite the missing `required`.
    if (!serializerRequiredFieldName.has(field) && zodRequiredFieldName.has(field) && !serializerField.hasDefault) {
      drifts.push({
        field: path,
        severity: "HIGH",
        message: `optional on the backend but required in zod (parse will fail if omitted)`,
      });
    }

    // base types
    const typeDrift = compareTypes(path, serializerField, zodField);
    if (typeDrift) {
      drifts.push(typeDrift);
    }

    // nullable
    if (serializerField.nullable && !zodField.nullable) {
      drifts.push({
        field: path,
        severity: "HIGH",
        message: `nullable on the backend, non-nullable in zod (parse will fail on null)`,
      });
    } else if (!serializerField.nullable && zodField.nullable) {
      drifts.push({
        field: path,
        severity: "MEDIUM",
        message: `non-nullable on the backend, nullable in zod (zod too permissive)`,
      });
    }

    // format
    if (serializerField.format && serializerField.format !== zodField.format) {
      drifts.push({
        field: path,
        severity: "MEDIUM",
        message: `backend format '${serializerField.format}' missing/divergent in zod`,
      });
    }

    if (serializerField.enumValues) {
      const zodSet = new Set(zodField.enumValues ?? []);
      const backSet = new Set(serializerField.enumValues ?? []);
      const missingZod = backSet.difference(zodSet);
      if (missingZod.size) {
        drifts.push({
          field: path,
          severity: "HIGH",
          message: `backend enum values absent in zod: ${Array.from(missingZod).join(", ")}`,
        });
      }
      const missingBack = zodSet.difference(backSet);
      if (missingBack.size) {
        drifts.push({
          field: path,
          severity: "MEDIUM",
          message: `extra zod enum values that will never be sent by back: ${Array.from(missingBack).join(", ")}`,
        });
      }
    }

    // Descend into nested objects and array-of-object elements.
    if (serializerField.object && zodField.object) {
      diffObject(zodField.object, serializerField.object, `${path}.`, drifts);
    }
    if (serializerField.items?.object && zodField.items?.object) {
      diffObject(zodField.items.object, serializerField.items.object, `${path}[].`, drifts);
    }
  }
}

function compareTypes(
  field: string,
  serializerDefinition: FieldDefinition,
  zodDefinition: FieldDefinition,
): FieldDrift | null {
  const serializerTypes = [...serializerDefinition.types].sort();
  const zodType = [...zodDefinition.types].sort();
  if (sameTypes(serializerTypes, zodType)) {
    return null;
  }
  // integer (backend) vs number (zod) is a common, lower-risk drift.
  const isInteger = (arr: string[]) => arr.map((t) => (t === "integer" ? "number" : t));
  if (sameTypes(isInteger(serializerTypes), isInteger(zodType))) {
    return {
      field,
      severity: "MEDIUM",
      message: `backend type '${serializerTypes.join("|")}' vs zod '${zodType.join("|")}' (integer/number)`,
    };
  }
  return {
    field,
    severity: "HIGH",
    message: `incompatible type — backend '${serializerTypes.join("|") || "?"}' vs zod '${zodType.join("|") || "?"}'`,
  };
}

function sameTypes(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((t, i) => t === b[i]);
}

function describe(fieldDefinition: FieldDefinition): string {
  const base = fieldDefinition.types.join("|") || "?";
  return `${fieldDefinition.format ? `${base}(${fieldDefinition.format})` : base}${fieldDefinition.nullable ? "|null" : ""}`;
}
