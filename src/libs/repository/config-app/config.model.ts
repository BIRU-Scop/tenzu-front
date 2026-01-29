/*
 * Copyright (C) 2024-2026 BIRU
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
import { z } from "zod/v4";
import { Injectable } from "@angular/core";

export const ConfigSchema = z.object({
  env: z.enum(["dev", "staging", "demo", "production"]),
  debug: z.boolean().optional().default(false),
  wsUrl: z.string(),
  api: z.object({
    prefix: z.string(),
    baseDomain: z.string(),
    scheme: z.enum(["http", "https"]),
    suffixDomain: z.string(),
  }),
  maxUploadFileSize: z.union([z.uint32(), z.null()]).default(100 * 1024 * 1024), //100 MB
  legal: z
    .union([
      z.object({
        tos: z.url(),
        privacy: z.url(),
        companyRegister: z.string().optional(),
        companyNumber: z.string().optional(),
        companyAddress: z.string().optional(),
        contactEmail: z.email().optional(),
      }),
      z.null(),
    ])
    .default(null),
  security: z
    .object({
      password: z
        .object({
          minLength: z.number().min(8).default(8),
          numberDiversityDifference: z.number().min(1).max(4).default(3),
          lengthSecureThreshold: z.number().default(12),
        })
        .refine((data) => data.lengthSecureThreshold >= data.minLength, {
          message: "lengthSecureThreshold must be greater than or equal to minLength",
          path: ["lengthSecureThreshold"],
        }),
    })
    .default({ password: { minLength: 8, numberDiversityDifference: 3, lengthSecureThreshold: 12 } }),
  sentry: z
    .object({
      dsn: z.string().optional(),
      environment: z.string().optional(),
    })
    .default({}),
});

export type ConfigModel = z.infer<typeof ConfigSchema>;

@Injectable({ providedIn: "root" })
export class ConfigSchemaService {
  schema() {
    return ConfigSchema;
  }
}
