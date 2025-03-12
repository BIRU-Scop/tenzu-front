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

import { Workspace } from "../workspace";
import { Workflow } from "../workflow";
import { UserMinimal } from "@tenzu/data/user";
import { MembershipRole } from "@tenzu/data/membership";

export interface ProjectBase {
  name: string;
  description?: string;
  color: number;
  logo?: File;
  logoSmall?: string;
  logoLarge?: string;
}

export type ProjectCreation = ProjectBase & {
  workspaceId: string;
};

export type ProjectSummary = ProjectBase & {
  id: string;
  workspaceId: string;
  slug: string;
  landingPage: string;
};

export type Project = ProjectSummary & {
  workspace: Pick<Workspace, "id" | "name" | "slug" | "color" | "userRole">;
  workflows: Workflow[];
  userIsAdmin: boolean;
  userIsMember: boolean;
  userPermissions: string[];
  userHasPendingInvitation: boolean;
  anonUserCanView?: boolean;
};

export type ProjectFilter = Record<string, never>;

export type ProjectAccept = Pick<Project, "id" | "workspaceId" | "name" | "slug" | "anonUserCanView" | "landingPage">;

export interface ProjectInvitationAccept {
  id: string;
  workspaceId: string;
  email: string;
  project: ProjectAccept;
  user: UserMinimal;
  role: MembershipRole;
}
