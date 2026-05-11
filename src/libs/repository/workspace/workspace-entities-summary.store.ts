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

import { signalStore, withMethods } from "@ngrx/signals";
import { WorkspaceDetail, WorkspaceSummary } from "./workspace.model";
import { withEntityDetailStore, withEntityListFeature } from "../base";
import { ProjectNested } from "@tenzu/repository/project";
import { ProjectImportationNested } from "@tenzu/repository/importation";

export const WorkspaceEntitiesSummaryStore = signalStore(
  { providedIn: "root" },
  withEntityListFeature<WorkspaceSummary>(),
  withMethods((store) => ({
    removeUserInvitedProjects(workspaceId: WorkspaceDetail["id"], projectId: ProjectNested["id"]) {
      const removedUserInvitedProjects = store
        .entityMap()
        [workspaceId].userInvitedProjects.filter((project) => project.id != projectId);
      store.updateEntity(workspaceId, { userInvitedProjects: removedUserInvitedProjects });
    },
    addUserMemberProjects(workspaceId: WorkspaceDetail["id"], project: ProjectNested) {
      const addedUserMemberProjects = [...store.entityMap()[workspaceId].userMemberProjects, project];
      store.updateEntity(workspaceId, { userMemberProjects: addedUserMemberProjects });
    },
    addUserImportedProjects(workspaceId: WorkspaceDetail["id"], projectImportation: ProjectImportationNested) {
      const addedUserImportedProjects = [...store.entityMap()[workspaceId].userImportedProjects, projectImportation];
      store.updateEntity(workspaceId, { userImportedProjects: addedUserImportedProjects });
    },
    removeUserImportedProjects(workspaceId: WorkspaceDetail["id"], projectImportationId: ProjectNested["id"]) {
      const removedUserImportedProjects = store
        .entityMap()
        [
          workspaceId
        ].userImportedProjects.filter((projectImportation) => projectImportation.id != projectImportationId);
      store.updateEntity(workspaceId, { userImportedProjects: removedUserImportedProjects });
    },
    updateUserImportedProjects(workspaceId: WorkspaceDetail["id"], newProjectImportation: ProjectImportationNested) {
      const updateddUserImportedProjects = store
        .entityMap()
        [
          workspaceId
        ].userImportedProjects.map((importation) => (importation.id !== newProjectImportation.id ? importation : newProjectImportation));
      store.updateEntity(workspaceId, { userImportedProjects: updateddUserImportedProjects });
    },
  })),
);

export const WorkspaceDetailStore = signalStore({ providedIn: "root" }, withEntityDetailStore<WorkspaceDetail>());
