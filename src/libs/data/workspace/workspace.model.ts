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

import { Project } from "../project";

export type WorkspaceProject = Pick<
  Project,
  "id" | "name" | "slug" | "description" | "color" | "logoSmall" | "landingPage" | "workspaceId"
>;

export type WorkspaceRole = "admin" | "member" | "guest" | "none";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  color: number;
  latestProjects: WorkspaceProject[];
  invitedProjects: WorkspaceProject[];
  totalProjects: number;
  hasProjects: boolean;
  userRole: WorkspaceRole;
}

// not implemented yet
export type WorkspaceFilter = Record<string, never>;

export interface WorkspaceCreation {
  name: string;
  color: number;
}

export interface WorkspaceEdition {
  name: string;
}

export interface InvitationInfo {
  status: "pending" | "accepted" | "revoked";
  email: string;
  existingUser: boolean;
  availableLogins: string[];
}

export interface ProjectInvitationInfo extends InvitationInfo {
  project: {
    id: string;
    name: string;
    slug: string;
    anonUserCanView: boolean;
  };
}

export interface WorkspaceInvitationInfo extends InvitationInfo {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
}
