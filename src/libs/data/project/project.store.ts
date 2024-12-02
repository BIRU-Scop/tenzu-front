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

import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { withEntities } from "@ngrx/signals/entities";
import { Project, ProjectSummary } from "./project.model";
import { withMethodEntity, withMethodsEntities } from "../../utils/store/store-features";
import { Workflow } from "@tenzu/data/workflow";

export const ProjectStore = signalStore({ providedIn: "root" }, withEntities<ProjectSummary>(), withMethodsEntities());

export const ProjectDetailStore = signalStore(
  { providedIn: "root" },
  withMethodEntity<Project>(),
  withMethods((store) => ({
    addWorkflow(workflow: Workflow) {
      const project = store.item();
      if (project) {
        project.workflows.push(workflow);
        patchState(store, {
          item: {
            ...project,
            workflows: { ...project.workflows },
          },
        });
      }
    },
  })),
);
