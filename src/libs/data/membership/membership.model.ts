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

import { UserMinimal } from "@tenzu/data/user";
import { Project } from "@tenzu/data/project";
import { Workspace } from "@tenzu/data/workspace";

export type ProjectForProjectMembership = Pick<
  Project,
  "logo" | "logoSmall" | "logoLarge" | "id" | "name" | "slug" | "description" | "color"
>;

export type WorkspaceForWorkspaceMembership = Pick<Workspace, "id" | "name" | "slug">;
export type WorkspaceInvitationContent = Pick<Workspace, "id" | "name" | "slug">;
export type ProjectInvitationContent = Pick<
  Project,
  "id" | "workspaceId" | "name" | "slug" | "anonUserCanView" | "landingPage"
>;

export type MembershipRole = {
  name: string;
  slug: string;
  isAdmin: true;
  permissions: string[];
};

export type ProjectMembership = {
  user: UserMinimal;
  role: MembershipRole;
  project: ProjectForProjectMembership;
};

export type WorkspaceMembership = {
  user: UserMinimal;
  workspace: WorkspaceForWorkspaceMembership;
  projects: ProjectForProjectMembership[];
};

export type ProjectInvitationDetail = {
  id: string;
  project: ProjectInvitationContent;
  user?: UserMinimal;
  email?: string;
  role?: MembershipRole;
  workspaceId?: Workspace["id"];
};

export type WorkspaceInvitationDetail = {
  id: string;
  workspace: WorkspaceInvitationContent;
  user?: UserMinimal;
  email?: string;
};

export type InvitationBase = {
  id: string;
  user: UserMinimal;
  email: string;
};

export type ProjectInvitation = InvitationBase & {
  role: MembershipRole;
};

export type WorkspaceInvitation = InvitationBase;

export type CreateWorkspaceInvitationResponse = {
  already_members: number;
  invitations: WorkspaceInvitation[];
};

export type CreateProjectInvitationResponse = {
  already_members: number;
  invitations: ProjectInvitation[];
};

export type WorkspaceGuest = Omit<WorkspaceMembership, "role">;
