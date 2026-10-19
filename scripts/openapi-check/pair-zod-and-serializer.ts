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

import { ZodSchemaAndSerializerPairing } from "./types";

export function getNameSerializer(zodSchemaName: string) {
  const base = zodSchemaName.replace(/Schema$/, "");
  const titleCase = base.charAt(0).toUpperCase() + base.slice(1);
  return [titleCase, `${titleCase}Serializer`];
}

export function pairZodAndSerializer(schemaNames: string[], componentNames: string[]): ZodSchemaAndSerializerPairing {
  const components = new Set(componentNames);
  const pairs: ZodSchemaAndSerializerPairing["zodSchemaAndSerializerPairs"] = [];
  const unmatched: string[] = [];
  for (const schemaName of schemaNames) {
    const componentName = getNameSerializer(schemaName).find((candidate) => components.has(candidate));
    if (componentName) {
      pairs.push({ zodSchemaName: schemaName, componentName });
    } else {
      unmatched.push(schemaName);
    }
  }
  return { zodSchemaAndSerializerPairs: pairs, unmatched };
}
