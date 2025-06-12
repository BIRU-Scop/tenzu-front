/*
 * Copyright (C) 2024-2025 BIRU
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

export const ConfigSchema = z.object({
  env: z.enum(["dev", "staging", "demo", "production"]),
  wsUrl: z.string(),
  api: z.object({
    prefix: z.string(),
    baseDomain: z.string(),
    scheme: z.enum(["http", "https"]),
    suffixDomain: z.string(),
  }),
  sentry: z.object({
    dsn: z.string().optional(),
    environment: z.string().optional(),
  }),
});

export type ConfigModel = z.infer<typeof ConfigSchema>;
