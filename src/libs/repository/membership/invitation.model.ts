/*
 * Copyright (C) 2025 BIRU
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

import { UserNested } from "../user";
import { Role } from "./membership.model";

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REVOKED = "revoked",
  DENIED = "denied",
}

export type InvitationBase = {
  id: string;
  status: InvitationStatus;
  user?: UserNested;
  roleId: Role["id"];
  email: string;
  resentAt?: string;
  createdAt: string;
  numEmailsSent: number;
};

export type CreateInvitations = {
  invitations: InvitationBase[];
  alreadyMembers: number;
};

export type PublicPendingInvitationBase = {
  email: string;
  existingUser: boolean;
};

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
