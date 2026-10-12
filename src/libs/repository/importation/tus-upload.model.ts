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

import * as z from "zod/v4";
import { isoDatetime } from "../base/schema-utils";
import { ProjectImportationType } from "./importation.model";

export const tusUploadStatusSchema = z.enum([
  "uploading",
  "retrying",
  "paused",
  "resuming",
  "canceling",
  "interrupted",
  "failed",
  "rejected",
]);
export type TusUploadStatus = z.infer<typeof tusUploadStatusSchema>;

export const tusUploadStateSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
  fileName: z.string(),
  fileSize: z.int(),
  fileType: z.string(),
  fileLastModified: z.int(),
  originType: z.enum(ProjectImportationType),
  bytesSent: z.int(),
  status: tusUploadStatusSchema,
  errorKey: z.string().optional(),
  errorMessage: z.string().optional(),
  createdAt: isoDatetime,
  expiresAt: isoDatetime,
});
export type TusUploadState = z.infer<typeof tusUploadStateSchema>;

export const tusChannelCommandSchema = z.enum(["pause", "resume", "cancel", "retry"]);
export type TusChannelCommand = z.infer<typeof tusChannelCommandSchema>;

export const tusChannelMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("state"), upload: tusUploadStateSchema }),
  z.object({ type: tusChannelCommandSchema, id: z.string() }),
  z.object({ type: z.literal("removed"), id: z.string() }),
  z.object({ type: z.literal("stop"), userId: z.string() }),
]);
export type TusChannelMessage = z.infer<typeof tusChannelMessageSchema>;
