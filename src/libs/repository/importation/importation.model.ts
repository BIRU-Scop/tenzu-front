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
import { optionalNullable } from "../base/schema-utils";
import { invitationBaseSchema } from "../membership/invitation.model";
import type { FileValue } from "../base/misc.model";
import { projectNestedSchema } from "../project/project-nested.model";

export enum ProjectImportationType {
  TENZU = "TZ",
  TAIGA = "TA",
  TRELLO = "TR",
}

export enum ImportationError {
  INVALID = "file_validation_failed",
  SERVER_ERROR = "server_error_while_processing",
}

export enum ImportationStatus {
  PENDING = "P",
  ONGOING = "O",
  ACTION_NEEDED = "A",
  SUCCESS = "S",
  FAILURE = "F",
}

export const projectImportationDataSchema = z.object({
  errorCode: z.enum(ImportationError).apply(optionalNullable),
  progressPercentage: z.number().apply(optionalNullable),
});
export type ProjectImportationData = z.infer<typeof projectImportationDataSchema>;

export const projectImportationPendingInvitationNestedSchema = z.object({
  email: z.string(),
  roleId: z.string(),
});
export type ProjectImportationPendingInvitationNested = z.infer<typeof projectImportationPendingInvitationNestedSchema>;

export const projectImportationNestedSchema = z.object({
  id: z.string(),
  status: z.enum(ImportationStatus),
  pendingInvites: z.array(projectImportationPendingInvitationNestedSchema),
});
export type ProjectImportationNested = z.infer<typeof projectImportationNestedSchema>;

export const projectImportationSchema = projectImportationNestedSchema.extend({
  extraData: projectImportationDataSchema,
  sourceName: z.string(),
  project: projectNestedSchema,
});
export type ProjectImportation = z.infer<typeof projectImportationSchema>;

export type CreateProjectImportationPayload = {
  source: FileValue;
  originType: ProjectImportationType;
};

export const invitedProjectImportationSchema = z.object({
  invitations: z.array(invitationBaseSchema),
  projectImportation: projectImportationSchema,
});
export type InvitedProjectImportation = z.infer<typeof invitedProjectImportationSchema>;
