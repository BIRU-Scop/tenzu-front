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
import { invitationBaseSchema, publicPendingInvitationBaseSchema } from "../membership/invitation.model";
import { workspaceLinkNestedSchema } from "../workspace/workspace-nested.model";

export const publicWorkspacePendingInvitationSchema = publicPendingInvitationBaseSchema.extend({
  workspace: workspaceLinkNestedSchema,
});
export type PublicWorkspacePendingInvitation = z.infer<typeof publicWorkspacePendingInvitationSchema>;

export const workspaceInvitationSchema = invitationBaseSchema.extend({
  workspace: workspaceLinkNestedSchema,
});
export type WorkspaceInvitation = z.infer<typeof workspaceInvitationSchema>;

export { workspaceInvitationNestedSchema } from "./workspace-invitation-nested.model";
export type { WorkspaceInvitationNested } from "./workspace-invitation-nested.model";
