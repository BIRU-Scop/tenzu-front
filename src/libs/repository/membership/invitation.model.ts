/*
 * Copyright (C) 2025-2026 BIRU
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
import { isoDatetime, optionalNullable } from "@tenzu/repository/base/schema-utils";
import { userNestedSchema } from "../user/user.model";
import type { Role } from "./membership.model";

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REVOKED = "revoked",
  DENIED = "denied",
}

export const invitationBaseSchema = z.object({
  id: z.string(),
  status: z.enum(InvitationStatus),
  user: userNestedSchema.apply(optionalNullable),
  roleId: z.string<Role["id"]>(),
  email: z.string(),
  resentAt: isoDatetime.apply(optionalNullable),
  createdAt: isoDatetime,
  numEmailsSent: z.number(),
});
export type InvitationBase = z.infer<typeof invitationBaseSchema>;

export const createInvitationsSchema = z.object({
  invitations: z.array(invitationBaseSchema),
  alreadyMembers: z.number(),
});
export type CreateInvitations = z.infer<typeof createInvitationsSchema>;

export const publicPendingInvitationBaseSchema = z.object({
  email: z.string(),
  existingUser: z.boolean(),
});
export type PublicPendingInvitationBase = z.infer<typeof publicPendingInvitationBaseSchema>;

export type InvitationsPayload = {
  invitations: {
    email?: string;
    username?: string;
    roleId: Role["id"];
  }[];
};

export function sortInvitation(a: InvitationBase, b: InvitationBase) {
  if (a.status !== b.status) {
    if (a.status === InvitationStatus.PENDING) return -1;
    if (b.status === InvitationStatus.PENDING) return 1;
  }
  if (a.user?.fullName === b.user?.fullName) {
    if (a.email < b.email) return -1;
    if (b.email < a.email) return 1;
    return 0;
  }
  if (b.user?.fullName === undefined) return -1;
  if (a.user?.fullName === undefined) return 1;
  if (a.user.fullName < b.user.fullName) return -1;
  return 1;
}
