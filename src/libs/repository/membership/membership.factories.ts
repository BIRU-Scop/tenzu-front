/*
 * Copyright (C) 2026 BIRU
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

import { MembershipBase, MemberPermission, Role } from "@tenzu/repository/membership/membership.model";
import {
  CreateInvitations,
  InvitationBase,
  InvitationStatus,
  PublicPendingInvitationBase,
} from "@tenzu/repository/membership/invitation.model";
import { makeUserNested } from "@tenzu/repository/user/user.factories";

export function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: "role-1",
    name: "Member",
    slug: "member",
    isOwner: false,
    order: 1,
    editable: true,
    permissions: [MemberPermission],
    ...overrides,
  };
}

export function makeMembershipBase(overrides: Partial<MembershipBase> = {}): MembershipBase {
  return {
    id: "membership-1",
    user: makeUserNested(),
    roleId: "role-1",
    ...overrides,
  };
}

export function makeInvitationBase(overrides: Partial<InvitationBase> = {}): InvitationBase {
  return {
    id: "invitation-1",
    status: InvitationStatus.PENDING,
    user: makeUserNested(),
    roleId: "role-1",
    email: "invitee@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    numEmailsSent: 1,
    ...overrides,
  };
}

export function makeCreateInvitations(overrides: Partial<CreateInvitations> = {}): CreateInvitations {
  return {
    invitations: [makeInvitationBase()],
    alreadyMembers: 0,
    ...overrides,
  };
}

export function makePublicPendingInvitationBase(
  overrides: Partial<PublicPendingInvitationBase> = {},
): PublicPendingInvitationBase {
  return {
    email: "invitee@example.com",
    existingUser: false,
    ...overrides,
  };
}
