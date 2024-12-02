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

import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { withMethodEntity } from "../../utils/store/store-features";
import { Workflow, WorkflowStatusReorderPayload } from "@tenzu/data/workflow/workflow.model";
import { Status } from "@tenzu/data/status";
import { moveItemInArray } from "@angular/cdk/drag-drop";

export const WorkflowStore = signalStore(
  { providedIn: "root" },
  withState({ statusesOrder: [] as string[], item: null as Workflow | null }),
  withMethodEntity(),
  withComputed((store) => ({
    listStatusesOrdered: computed(() => {
      const statuses = store.item()?.statuses;
      const selectedEntityStatusOrder = store.statusesOrder();
      if (statuses) {
        return selectedEntityStatusOrder.map((statusId) => statuses.find((status) => status.id === statusId) as Status);
      } else {
        return [];
      }
    }),
  })),
  withMethods((store) => ({
    setWorkflow(refreshedWorkflow: Workflow) {
      store.set(refreshedWorkflow);
      patchState(store, { statusesOrder: refreshedWorkflow.statuses.map((status) => status.id) });
      return refreshedWorkflow;
    },
    addStatus(status: Status) {
      const selectedWorkflow = store.item();
      if (selectedWorkflow) {
        patchState(store, { item: { ...selectedWorkflow, statuses: [...selectedWorkflow.statuses, status] } });
        const refreshedWorkflow = store.item();
        if (refreshedWorkflow) {
          patchState(store, { statusesOrder: refreshedWorkflow.statuses.map((status) => status.id) });
        }
      }
    },
    reorder(oldPosition: number, newPosition: number) {
      const selectedEntityStatusOrder = store.statusesOrder();

      moveItemInArray(selectedEntityStatusOrder, oldPosition, newPosition);
      patchState(store, { statusesOrder: [...selectedEntityStatusOrder] });
      const statuses = store.listStatusesOrdered();
      const status = statuses[newPosition];
      let payload: WorkflowStatusReorderPayload | null = null;
      if (newPosition < oldPosition) {
        payload = {
          statuses: [status.id],
          reorder: {
            place: "before",
            status: statuses[newPosition + 1].id,
          },
        };
      } else {
        payload = {
          statuses: [status.id],
          reorder: {
            place: "after",
            status: statuses[newPosition - 1].id,
          },
        };
      }
      return payload;
    },
    removeStatus(statusId: string) {
      const selectedWorkflow = store.item();
      if (selectedWorkflow) {
        const statusIndex = selectedWorkflow.statuses.findIndex((curr) => statusId === curr.id);
        store.patch({
          statuses: [
            ...selectedWorkflow.statuses.slice(0, statusIndex),
            ...selectedWorkflow.statuses.slice(statusIndex + 1),
          ],
        });
        const refreshedWorkflow = store.item();
        if (refreshedWorkflow) {
          patchState(store, { statusesOrder: refreshedWorkflow.statuses.map((status) => status.id) });
        }
      }
    },
    updateStatus(status: Status) {
      const selectedWorkflow = store.item();
      if (selectedWorkflow) {
        const statusIndex = selectedWorkflow.statuses.findIndex((curr) => status.id === curr.id);
        store.patch({
          statuses: [
            ...selectedWorkflow.statuses.slice(0, statusIndex),
            status,
            ...selectedWorkflow.statuses.slice(statusIndex + 1),
          ],
        });
        // patchState(store, {
        //   item: {
        //     ...selectedWorkflow,
        //     statuses: [
        //       ...selectedWorkflow.statuses.slice(0, statusIndex),
        //       status,
        //       ...selectedWorkflow.statuses.slice(statusIndex + 1),
        //     ],
        //   },
        // });
      }
    },
  })),
);

export type WorkflowStore = InstanceType<typeof WorkflowStore>;
