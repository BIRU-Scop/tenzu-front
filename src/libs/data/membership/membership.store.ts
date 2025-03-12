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

import { patchState, signalStore, type, withMethods } from "@ngrx/signals";
import {
  removeAllEntities,
  removeEntity,
  SelectEntityId,
  setAllEntities,
  setEntities,
  setEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { withLoadingStatus } from "../../utils/store/store-features";
import {
  WorkspaceGuest,
  ProjectMembership,
  WorkspaceMembership,
  ProjectInvitationDetail,
  WorkspaceInvitationDetail,
} from "@tenzu/data/membership/membership.model";

const selectIdProjectMembership: SelectEntityId<ProjectMembership> = (membership) => membership.user.username;
const selectIdProjectInvitations: SelectEntityId<ProjectInvitationDetail> = (membership) => membership.id;
const selectIdWorkspaceMembership: SelectEntityId<WorkspaceMembership> = (membership) => membership.user.username;
const selectIdWorkspaceGuests: SelectEntityId<WorkspaceGuest> = (membership) => membership.user.username;
const selectIdWorkspaceInvitations: SelectEntityId<WorkspaceInvitationDetail> = (membership) => membership.id;

export enum MembershipStoreCollections {
  PROJECT = "project",
  PROJECT_INVITATIONS = "projectInvitations",
  WORKSPACE = "workspace",
  WORKSPACE_GUESTS = "workspaceGuests",
  WORKSPACE_INVITATIONS = "workspaceInvitations",
}

export const MembershipStore = signalStore(
  { providedIn: "root" },
  withEntities({ entity: type<ProjectMembership>(), collection: MembershipStoreCollections.PROJECT }),
  withEntities({ entity: type<WorkspaceMembership>(), collection: MembershipStoreCollections.WORKSPACE }),
  withEntities({ entity: type<WorkspaceGuest>(), collection: MembershipStoreCollections.WORKSPACE_GUESTS }),
  withEntities({ entity: type<ProjectInvitationDetail>(), collection: MembershipStoreCollections.PROJECT_INVITATIONS }),
  withEntities({
    entity: type<WorkspaceInvitationDetail>(),
    collection: MembershipStoreCollections.WORKSPACE_INVITATIONS,
  }),

  withLoadingStatus(),
  withMethods((store) => ({
    async listProjectMembership(projectMemberships: ProjectMembership[]) {
      patchState(
        store,
        setAllEntities(projectMemberships, {
          collection: MembershipStoreCollections.PROJECT,
          selectId: selectIdProjectMembership,
        }),
      );
      return projectMemberships;
    },
    async listProjectInvitations(projectInvitations: ProjectInvitationDetail[]) {
      patchState(
        store,
        setAllEntities(projectInvitations, {
          collection: MembershipStoreCollections.PROJECT_INVITATIONS,
          selectId: selectIdProjectInvitations,
        }),
      );
      return projectInvitations;
    },
    async listWorkspaceMembership(workspaceMemberships: WorkspaceMembership[]) {
      patchState(
        store,
        setAllEntities(workspaceMemberships, {
          collection: MembershipStoreCollections.WORKSPACE,
          selectId: selectIdWorkspaceMembership,
        }),
      );
      return workspaceMemberships;
    },
    async listWorkspaceGuest(workspaceGuests: WorkspaceGuest[]) {
      patchState(
        store,
        setAllEntities(workspaceGuests, {
          collection: MembershipStoreCollections.WORKSPACE_GUESTS,
          selectId: selectIdWorkspaceGuests,
        }),
      );
      return workspaceGuests;
    },
    async listWorkspaceInvitations(workspaceInvitations: WorkspaceInvitationDetail[]) {
      patchState(
        store,
        setAllEntities(workspaceInvitations, {
          collection: MembershipStoreCollections.WORKSPACE_INVITATIONS,
          selectId: selectIdWorkspaceInvitations,
        }),
      );
      return workspaceInvitations;
    },
    async patchProjectMembership(projectMembership: ProjectMembership) {
      setEntity(projectMembership, {
        collection: MembershipStoreCollections.PROJECT,
        selectId: selectIdProjectMembership,
      });
      return projectMembership;
    },
    async deleteProjectMembership(username: string) {
      removeEntity(username, { collection: MembershipStoreCollections.PROJECT });
    },
    async deleteWorkspaceMembership(username: string) {
      removeEntity(username, { collection: MembershipStoreCollections.WORKSPACE });
      removeEntity(username, { collection: MembershipStoreCollections.WORKSPACE_GUESTS });
    },

    async setWorkspaceInvitations(invitations: WorkspaceInvitationDetail[]) {
      patchState(
        store,
        setEntities(invitations, {
          collection: MembershipStoreCollections.WORKSPACE_INVITATIONS,
          selectId: selectIdWorkspaceInvitations,
        }),
      );
    },

    async setProjectInvitations(invitations: ProjectInvitationDetail[]) {
      patchState(
        store,
        setEntities(invitations, {
          collection: MembershipStoreCollections.PROJECT_INVITATIONS,
          selectId: selectIdProjectInvitations,
        }),
      );
    },
    reset() {
      patchState(store, removeAllEntities({ collection: MembershipStoreCollections.WORKSPACE_INVITATIONS }));
      patchState(store, removeAllEntities({ collection: MembershipStoreCollections.PROJECT_INVITATIONS }));
      patchState(store, removeAllEntities({ collection: MembershipStoreCollections.PROJECT }));
      patchState(store, removeAllEntities({ collection: MembershipStoreCollections.WORKSPACE }));
      patchState(store, removeAllEntities({ collection: MembershipStoreCollections.WORKSPACE_GUESTS }));
    },
  })),
);
