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

import { glob } from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod/v4";
import { isZodSchema } from "./is-zod-schema";

export type LoadedZodSchema = { name: string; zodSchema: z.ZodType; file: string };
export type LoadZodResult = { zodSchemas: LoadedZodSchema[]; errors: { file: string; error: string }[] };

export async function loadZodSchemas(rootDir: string): Promise<LoadZodResult> {
  const zodSchemas: LoadedZodSchema[] = [];
  const errors: LoadZodResult["errors"] = [];

  const seen = new Set<object>();

  for await (const relativePath of glob("src/libs/repository/**/*.model.ts", { cwd: rootDir })) {
    if (relativePath.split(path.sep).includes("config-app")) continue;
    const absolute = path.join(rootDir, relativePath);
    try {
      const mod = (await import(pathToFileURL(absolute).href)) as Record<string, unknown>;
      for (const [name, value] of Object.entries(mod)) {
        if (name.endsWith("Schema") && isZodSchema(value) && !seen.has(value)) {
          seen.add(value);
          zodSchemas.push({ name, zodSchema: value, file: relativePath });
        }
      }
    } catch (error) {
      errors.push({ file: relativePath, error: (error as Error).message });
    }
  }
  return { zodSchemas: zodSchemas, errors };
}
