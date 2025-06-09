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

import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Workflow, ReorderWorkflowStatusesPayload } from "./workflow.model";
import { StatusSummary } from "../status";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import { removeEntity, setAllEntities, updateEntity, withEntities } from "@ngrx/signals/entities";
import { withEntityDetailStore } from "../base";

export const WorkflowDetailStore = signalStore(
  { providedIn: "root" },
  withEntities<StatusSummary>(),
  withState({
    statusesMap: {} as Record<string, StatusSummary>,
  }),
  withEntityDetailStore<Workflow>(),
  withMethods((store) => ({
    setWorkflow(refreshedWorkflow: Workflow) {
      store.set(refreshedWorkflow);
      patchState(store, setAllEntities(refreshedWorkflow.statuses));
      return refreshedWorkflow;
    },
    addStatus(status: StatusSummary) {
      const selectedWorkflow = store.item();
      if (selectedWorkflow) {
        patchState(store, setAllEntities([...store.entities(), status]));
      }
    },
    reorder(oldPosition: number, newPosition: number) {
      const selectedEntityStatusOrder = store.entities();

      moveItemInArray(selectedEntityStatusOrder, oldPosition, newPosition);
      patchState(store, setAllEntities(selectedEntityStatusOrder));
      const statuses = store.entities();
      const status = statuses[newPosition];
      let payload: ReorderWorkflowStatusesPayload | null = null;
      if (newPosition < oldPosition) {
        payload = {
          statusIds: [status.id],
          reorder: {
            place: "before",
            statusId: statuses[newPosition + 1].id,
          },
        };
      } else {
        payload = {
          statusIds: [status.id],
          reorder: {
            place: "after",
            statusId: statuses[newPosition - 1].id,
          },
        };
      }
      return payload;
    },
    removeStatus(statusId: string) {
      patchState(store, removeEntity(statusId));
    },
    updateStatus(status: StatusSummary) {
      patchState(store, updateEntity({ id: status.id, changes: { ...status } }));
    },
  })),
);
