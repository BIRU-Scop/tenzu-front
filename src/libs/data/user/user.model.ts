/*
 * Copyright (C) 2024 BIRU
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

import { Tokens } from "@tenzu/data/auth";
import { ProjectInvitationInfo, Workspace, WorkspaceInvitationInfo, WorkspaceProject } from "@tenzu/data/workspace";

import { ProjectBase } from "@tenzu/data/project";

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

export interface UserFilter {
  project?: number;
}

export type WorkspaceForDelete = Pick<Workspace, "id" | "name" | "slug" | "color"> & {
  projects: WorkspaceProject[];
};

export type ProjectForDelete = ProjectBase & {
  id: string;
  logoSmall?: string;
  logoLarge?: string;
  workspace: Pick<Workspace, "id" | "name" | "slug">;
};

export type UserDeleteInfo = {
  workspaces: WorkspaceForDelete[];
  projects: ProjectForDelete[];
};

export type VerificationData = {
  auth: Tokens;
  workspaceInvitation: WorkspaceInvitationInfo;
  projectInvitationToken: ProjectInvitationInfo;
};
