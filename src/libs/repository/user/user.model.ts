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

import { Tokens } from "../auth";
import { WorkspaceSummary } from "../workspace";

import { ProjectSummary } from "../project";
import { ProjectInvitation } from "../project-invitations";
import { WorkspaceInvitation } from "../workspace-invitations";

export interface User {
  username: string;
  fullName: string;
  color: number;
  email: string;
  lang: string;
}

export type UserMinimal = Pick<User, "username" | "fullName" | "color">;

export type UserCreation = Omit<User, "username" | "color" | "lang"> & {
  password: string;
  username?: string;
  acceptTerms: boolean;
  color?: number;
  lang?: string;
  projectInvitationToken?: string;
  workspaceInvitationToken?: string;
  acceptProjectInvitation?: boolean;
  acceptWorkspaceInvitation?: boolean;
};

export type UserEdition = {
  fullName: string;
  lang: string;
  password: string;
};

type WorkspaceForDelete = Pick<WorkspaceSummary, "id" | "name" | "slug" | "color"> & {
  projects: ProjectSummary[];
};

export type UserDeleteInfo = {
  onlyOwnerCollectiveWorkspaces: Pick<WorkspaceSummary, "id" | "name" | "slug" | "color">[];
  onlyOwnerCollectiveProjects: ProjectSummary[];
  onlyMemberWorkspaces: WorkspaceForDelete[];
  onlyMemberProjects: ProjectSummary[];
};

export type VerificationInfo = {
  auth: Tokens;
  workspaceInvitation: WorkspaceInvitation;
  projectInvitationToken: ProjectInvitation;
};
