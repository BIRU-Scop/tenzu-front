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

import $RefParser from "@apidevtools/json-schema-ref-parser";
import { JsonNode } from "./types";

export type OpenApiComponents = Record<string, JsonNode>;

export async function fetchOpenApi(url: string): Promise<OpenApiComponents> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenAPI HTTP ${response.status} at ${url}.`);
  }

  const text = await response.text();

  const doc = JSON.parse(text) as { components?: { schemas?: OpenApiComponents } };
  const dereferenced = (await $RefParser.dereference(doc, { resolve: { external: false } })) as {
    components?: { schemas?: OpenApiComponents };
  };
  return dereferenced.components?.schemas ?? {};
}
