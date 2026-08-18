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
import { workflowNestedSchema } from "../workflow/workflow-nested.model";

export const workflowStatusNestedSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.int(),
  order: z.int(),
});
export type WorkflowStatusNested = z.infer<typeof workflowStatusNestedSchema>;

export const workflowStatusSchema = workflowStatusNestedSchema.extend({
  workflow: workflowNestedSchema,
});
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;
