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
import { tokensSchema } from "../auth/auth.model";
import type { InvitationTokens } from "../auth/auth.model";
import type { WorkspaceNested } from "../workspace/workspace.model";
import type { ProjectLinkNested, ProjectNested } from "../project/project.model";
import type { ProjectInvitationNested } from "../project-invitations/project-invitation.model";
import type { WorkspaceInvitationNested } from "../workspace-invitations/workspace-invitation.model";

export const userNestedSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  color: z.number(),
  email: z.string(),
});
export type UserNested = z.infer<typeof userNestedSchema>;

export const userSchema = userNestedSchema.extend({
  lang: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const verificationInfoSchema = z.object({
  auth: tokensSchema,
  workspaceInvitation: z.custom<WorkspaceInvitationNested>(),
  projectInvitationToken: z.custom<ProjectInvitationNested>(),
});
export type VerificationInfo = z.infer<typeof verificationInfoSchema>;

type _WorkspaceForDeleteWithProjectsNested = WorkspaceNested & {
  projects: ProjectLinkNested[];
};

export const userDeleteInfoSchema = z.object({
  onlyOwnerCollectiveWorkspaces: z.array(z.custom<WorkspaceNested>()),
  onlyOwnerCollectiveProjects: z.array(z.custom<ProjectNested>()),
  onlyMemberWorkspaces: z.array(z.custom<_WorkspaceForDeleteWithProjectsNested>()),
  onlyMemberProjects: z.array(z.custom<ProjectNested>()),
});
export type UserDeleteInfo = z.infer<typeof userDeleteInfoSchema>;

export type SendVerifyUserValidator = Pick<User, "email"> & InvitationTokens;

export type CreateUserPayload = Pick<User, "fullName"> &
  SendVerifyUserValidator & {
    password: string;
    acceptTermsOfService: boolean;
    acceptPrivacyPolicy: boolean;
    color?: number;
    lang: string;
  };

export type UpdateUserPayload = Partial<
  Pick<User, "fullName" | "lang"> & {
    password: string;
  }
>;
