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
import { workspaceNestedSchema } from "../workspace/workspace-nested.model";
import { projectNestedSchema, projectLinkNestedSchema } from "../project/project-nested.model";
import { projectInvitationNestedSchema } from "../project-invitations/project-invitation-nested.model";
import { workspaceInvitationNestedSchema } from "../workspace-invitations/workspace-invitation-nested.model";
import { optionalNullable } from "../base/schema-utils";

export const userNestedSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  color: z.int(),
  email: z.email(),
});
export type UserNested = z.infer<typeof userNestedSchema>;

export const userSchema = userNestedSchema.extend({
  lang: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const verificationInfoSchema = z.object({
  auth: tokensSchema,
  workspaceInvitation: workspaceInvitationNestedSchema.apply(optionalNullable),
  projectInvitation: projectInvitationNestedSchema.apply(optionalNullable),
});
export type VerificationInfo = z.infer<typeof verificationInfoSchema>;

const workspaceForDeleteWithProjectsNestedSchema = workspaceNestedSchema.extend({
  projects: z.array(projectLinkNestedSchema),
});

export const userDeleteInfoSchema = z.object({
  onlyOwnerCollectiveWorkspaces: z.array(workspaceNestedSchema),
  onlyOwnerCollectiveProjects: z.array(projectNestedSchema),
  onlyMemberWorkspaces: z.array(workspaceForDeleteWithProjectsNestedSchema),
  onlyMemberProjects: z.array(projectNestedSchema),
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
