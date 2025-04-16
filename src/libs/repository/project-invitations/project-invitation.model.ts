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

import { UserMinimal } from "../user";
import { ProjectDetail, ProjectSummary } from "../project";
import { MembershipRole } from "../base/misc.model";

export type ProjectInvitationContent = Pick<ProjectDetail, "id" | "workspaceId" | "name" | "slug" | "landingPage">;

export type ProjectInvitation = {
  id: string;
  status: "pending" | "accepted" | "revoked";
  email?: string;
  existingUser: boolean;
  role?: MembershipRole;
  user?: UserMinimal;
  project: ProjectInvitationContent;
};

export type CreateProjectInvitationResponse = {
  already_members: number;
  invitations: ProjectInvitation[];
};
export type CreateProjectInvitation = {
  email: string;
  roleSlug: string;
};

export type CreateProjectInvitationRequest = {
  invitations: CreateProjectInvitation[];
};

export interface ProjectInvitationAccept {
  id: string;
  workspaceId: string;
  email: string;
  project: ProjectSummary;
  user: UserMinimal;
  role: MembershipRole;
}
