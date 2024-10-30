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

import { patchState, signalStore, type, withMethods } from "@ngrx/signals";
import {
  removeEntity,
  SelectEntityId,
  setAllEntities,
  setEntities,
  setEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { inject } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { setLoadingBegin, setLoadingEnd, withLoadingStatus } from "../../utils/store/store-features";
import {
  WorkspaceGuest,
  ProjectMembership,
  WorkspaceMembership,
  Invitation,
} from "@tenzu/data/membership/membership.model";
import { MembershipService } from "@tenzu/data/membership/membership.service";

const selectIdProjectMembership: SelectEntityId<ProjectMembership> = (membership) => membership.user.username;
const selectIdProjectInvitations: SelectEntityId<Invitation> = (membership) => membership.id;
const selectIdWorkspaceMembership: SelectEntityId<WorkspaceMembership> = (membership) => membership.user.username;
const selectIdWorkspaceGuests: SelectEntityId<WorkspaceGuest> = (membership) => membership.user.username;
const selectIdWorkspaceInvitations: SelectEntityId<Invitation> = (membership) => membership.id;

export const MembershipStore = signalStore(
  { providedIn: "root" },
  withEntities({ entity: type<ProjectMembership>(), collection: "project" }),
  withEntities({ entity: type<Invitation>(), collection: "projectInvitations" }),
  withEntities({ entity: type<WorkspaceMembership>(), collection: "workspace" }),
  withEntities({ entity: type<WorkspaceGuest>(), collection: "workspaceGuests" }),
  withEntities({ entity: type<Invitation>(), collection: "workspaceInvitations" }),

  withLoadingStatus(),
  withMethods((store, membershipService = inject(MembershipService)) => ({
    async listProjectMembership(projectId: string) {
      patchState(store, setLoadingBegin());
      const projectMemberships = await lastValueFrom(membershipService.listProjectMembership(projectId));
      patchState(store, setLoadingEnd());
      patchState(
        store,
        setAllEntities(projectMemberships, { collection: "project", selectId: selectIdProjectMembership }),
      );
      return projectMemberships;
    },
    async listProjectInvitations(projectId: string) {
      patchState(store, setLoadingBegin());
      const projectInvitations = await lastValueFrom(membershipService.listProjectInvitations(projectId));
      patchState(store, setLoadingEnd());
      patchState(
        store,
        setAllEntities(projectInvitations, { collection: "projectInvitations", selectId: selectIdProjectInvitations }),
      );
      return projectInvitations;
    },
    async listWorkspaceMembership(workspaceId: string) {
      patchState(store, setLoadingBegin());
      const workspaceMemberships = await lastValueFrom(membershipService.listWorkspaceMembership(workspaceId));
      patchState(store, setLoadingEnd());
      patchState(
        store,
        setAllEntities(workspaceMemberships, { collection: "workspace", selectId: selectIdWorkspaceMembership }),
      );
      return workspaceMemberships;
    },
    async listWorkspaceGuest(workspaceId: string) {
      patchState(store, setLoadingBegin());
      const workspaceGuests = await lastValueFrom(membershipService.listWorkspaceGuest(workspaceId));
      patchState(store, setLoadingEnd());
      patchState(
        store,
        setAllEntities(workspaceGuests, { collection: "workspaceGuests", selectId: selectIdWorkspaceGuests }),
      );
      return workspaceGuests;
    },
    async listWorkspaceInvitations(workspaceId: string) {
      patchState(store, setLoadingBegin());
      const workspaceInvitations = await lastValueFrom(membershipService.listWorkspaceInvitations(workspaceId));
      patchState(store, setLoadingEnd());
      patchState(
        store,
        setAllEntities(workspaceInvitations, {
          collection: "workspaceInvitations",
          selectId: selectIdWorkspaceInvitations,
        }),
      );
      return workspaceInvitations;
    },
    async patchProjectMembership(projectId: string, username: string, patchValue: Partial<ProjectMembership>) {
      patchState(store, setLoadingBegin());
      const projectMembership = await lastValueFrom(
        membershipService.patchProjectMembership(projectId, username, patchValue),
      );
      patchState(store, setLoadingEnd());
      setEntity(projectMembership, { collection: "project", selectId: selectIdProjectMembership });
      return projectMembership;
    },
    async deleteProjectMembership(projectId: string, username: string) {
      patchState(store, setLoadingBegin());
      await lastValueFrom(membershipService.deleteProjectMembership(projectId, username));
      patchState(store, setLoadingEnd());
      removeEntity(projectId, { collection: "project" });
    },
    async deleteWorkspaceMembership(workspaceId: string, username: string) {
      patchState(store, setLoadingBegin());
      await lastValueFrom(membershipService.deleteWorkspaceMembership(workspaceId, username));
      patchState(store, setLoadingEnd());
      removeEntity(workspaceId, { collection: "workspace" });
      removeEntity(workspaceId, { collection: "guest" });
    },

    async sendWorkspaceInvitations(workspaceId: string, invitationsMail: string[]) {
      const newWorkspaceInvitations = await lastValueFrom(
        membershipService.sendWorkspaceInvitations(workspaceId, invitationsMail),
      );
      patchState(
        store,
        setEntities(newWorkspaceInvitations.invitations, {
          collection: "workspaceInvitations",
          selectId: selectIdWorkspaceInvitations,
        }),
      );
    },

    async sendProjectInvitations(projectId: string, invitationsMail: string[]) {
      const newProjectInvitations = await lastValueFrom(
        membershipService.sendProjectInvitations(projectId, invitationsMail),
      );
      patchState(
        store,
        setEntities(newProjectInvitations.invitations, {
          collection: "projectInvitations",
          selectId: selectIdProjectInvitations,
        }),
      );
    },
  })),
);
