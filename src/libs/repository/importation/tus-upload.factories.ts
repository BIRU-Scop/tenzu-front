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

import { ProjectImportationType } from "./importation.model";
import { TusUploadState } from "./tus-upload.model";

export function makeTusUploadState(overrides: Partial<TusUploadState> = {}): TusUploadState {
  return {
    id: "tus-upload-1",
    userId: "user-1",
    workspaceId: "workspace-1",
    fileName: "backup.json",
    fileSize: 200,
    fileType: "application/json",
    fileLastModified: 1_700_000_000_000,
    originType: ProjectImportationType.TAIGA,
    bytesSent: 0,
    status: "uploading",
    createdAt: "2026-10-03T14:30:00.000Z",
    expiresAt: "2026-10-05T14:30:00.000Z",
    ...overrides,
  };
}
