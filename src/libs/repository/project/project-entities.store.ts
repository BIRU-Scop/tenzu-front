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

import { patchState, signalStore, withMethods } from "@ngrx/signals";
import { ProjectDetail, ProjectSummary } from "./project.model";
import { Workflow } from "../workflow";
import { withEntityDetailStore, withEntityListFeature } from "../base";

export const ProjectEntitiesSummaryStore = signalStore({ providedIn: "root" }, withEntityListFeature<ProjectSummary>());

export const ProjectDetailStore = signalStore(
  { providedIn: "root" },
  withEntityDetailStore<ProjectDetail>(),
  withMethods((store) => ({
    addWorkflow(workflow: Workflow) {
      const project = store.item();
      if (project) {
        patchState(store, {
          item: {
            ...project,
            workflows: [...project.workflows, workflow],
          },
        });
      }
    },
    editWorkflow(workflow: Workflow) {
      const project = store.item();
      if (project) {
        const workflows = [...project.workflows];
        const workflowIndex = workflows.findIndex((workflowIterator) => workflowIterator.id === workflow.id);
        workflows[workflowIndex] = workflow;
        store.update(project.id, { ...project, workflows: workflows });
      }
    },
    deleteWorkflow(workflow: Workflow) {
      const project = store.item();
      if (project) {
        let workflows = [...project.workflows];
        workflows = workflows.filter((workflowIterator) => workflowIterator.id !== workflow.id);
        store.update(project.id, { ...project, workflows: workflows });
      }
    },
  })),
);
