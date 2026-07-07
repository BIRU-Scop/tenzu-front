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

import { describe, expect, it } from "vitest";

import {
  createInvitationsSchema,
  invitationBaseSchema,
  membershipBaseSchema,
  publicPendingInvitationBaseSchema,
  roleSchema,
} from "@tenzu/repository/membership";
import {
  makeCreateInvitations,
  makeInvitationBase,
  makeMembershipBase,
  makePublicPendingInvitationBase,
  makeRole,
} from "./membership.factories";

describe("membership schemas", () => {
  it("accept their factory payloads", () => {
    expect(() => roleSchema.parse(makeRole())).not.toThrow();
    expect(() => membershipBaseSchema.parse(makeMembershipBase())).not.toThrow();
    expect(() => invitationBaseSchema.parse(makeInvitationBase())).not.toThrow();
    expect(() => createInvitationsSchema.parse(makeCreateInvitations())).not.toThrow();
    expect(() => publicPendingInvitationBaseSchema.parse(makePublicPendingInvitationBase())).not.toThrow();
  });

  it("reject non-conforming payloads", () => {
    expect(() => roleSchema.parse({ ...makeRole(), order: "high" })).toThrow();
    expect(() => invitationBaseSchema.parse({ ...makeInvitationBase(), status: "unknown" })).toThrow();
    expect(() => invitationBaseSchema.parse({ ...makeInvitationBase(), createdAt: "not-a-date" })).toThrow();
    expect(() => membershipBaseSchema.parse({ ...makeMembershipBase(), user: { id: "user-1" } })).toThrow();
  });
});
