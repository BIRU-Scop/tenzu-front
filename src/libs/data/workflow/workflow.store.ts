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
import { computed, inject } from "@angular/core";
import { addEntity, setEntity, updateEntity, withEntities } from "@ngrx/signals/entities";
import { setSelectedEntity, withLoadingStatus, withSelectedEntity } from "../../utils/store/store-features";
import { Workflow, WorkflowStatusReorderPayload } from "@tenzu/data/workflow/workflow.model";
import { WorkflowInfraService } from "@tenzu/data/workflow/workflow-infra.service";
import { lastValueFrom } from "rxjs";
import { Status } from "@tenzu/data/status";
import { moveItemInArray } from "@angular/cdk/drag-drop";

export const WorkflowStore = signalStore(
  { providedIn: "root" },
  withEntities<Workflow>(),
  withSelectedEntity(),
  withLoadingStatus(),
  withState({ selectedEntityStatusesOrder: [] as string[] }),
  withComputed((store) => ({
    listStatusesOrdered: computed(() => {
      const statuses = store.selectedEntity()?.statuses;
      const selectedEntityStatusOrder = store.selectedEntityStatusesOrder();
      if (statuses) {
        return selectedEntityStatusOrder.map((statusId) => statuses.find((status) => status.id === statusId) as Status);
      } else {
        return [];
      }
    }),
  })),
  withMethods((store) => ({
    setWorkflow(refreshedWorkflow: Workflow) {
      patchState(store, setEntity(refreshedWorkflow));
      patchState(store, { selectedEntityStatusesOrder: refreshedWorkflow.statuses.map((status) => status.id) });
      return refreshedWorkflow;
    },
  })),
  withMethods((store, workflowService = inject(WorkflowInfraService)) => ({
    selectWorkflow(workflowId: string) {
      patchState(store, setSelectedEntity(workflowId));
    },
    async refreshWorkflowById(projectId: string, workflowId: string) {
      const refreshedWorkflow = await lastValueFrom(workflowService.getById(projectId, workflowId));
      store.setWorkflow({ ...refreshedWorkflow });
      return refreshedWorkflow;
    },
    async refreshWorkflow(workflow: Pick<Workflow, "projectId" | "slug">) {
      const refreshedWorkflow = await lastValueFrom(workflowService.get(workflow.projectId, workflow.slug));
      store.setWorkflow(refreshedWorkflow);
      return refreshedWorkflow;
    },
    addStatus(status: Status) {
      const selectedWorkflow = store.selectedEntity();
      if (selectedWorkflow) {
        patchState(
          store,
          updateEntity({
            id: selectedWorkflow.id,
            changes: { ...selectedWorkflow, statuses: [...selectedWorkflow.statuses, status] },
          }),
        );
        const refreshedWorkflow = store.selectedEntity();
        if (refreshedWorkflow) {
          patchState(store, { selectedEntityStatusesOrder: refreshedWorkflow.statuses.map((status) => status.id) });
        }
      }
    },
    async reorder(projectId: string, workflowId: string, oldPosition: number, newPosition: number) {
      const selectedEntityStatusOrder = store.selectedEntityStatusesOrder();

      moveItemInArray(selectedEntityStatusOrder, oldPosition, newPosition);
      patchState(store, { selectedEntityStatusesOrder: [...selectedEntityStatusOrder] });
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
      await lastValueFrom(workflowService.reorderStatus(projectId, workflowId, payload));
    },
    removeStatus(statusId: string) {
      const selectedWorkflow = store.selectedEntity();
      if (selectedWorkflow) {
        const statusIndex = selectedWorkflow.statuses.findIndex((curr) => statusId === curr.id);
        patchState(
          store,
          updateEntity({
            id: selectedWorkflow.id,
            changes: {
              ...selectedWorkflow,
              statuses: [
                ...selectedWorkflow.statuses.slice(0, statusIndex),
                ...selectedWorkflow.statuses.slice(statusIndex + 1),
              ],
            },
          }),
        );
        const refreshedWorkflow = store.selectedEntity();
        if (refreshedWorkflow) {
          patchState(store, { selectedEntityStatusesOrder: refreshedWorkflow.statuses.map((status) => status.id) });
        }
      }
    },
    updateStatus(status: Status) {
      const selectedWorkflow = store.selectedEntity();
      if (selectedWorkflow) {
        const statusIndex = selectedWorkflow.statuses.findIndex((curr) => status.id === curr.id);
        patchState(
          store,
          updateEntity({
            id: selectedWorkflow.id,
            changes: {
              ...selectedWorkflow,
              statuses: [
                ...selectedWorkflow.statuses.slice(0, statusIndex),
                status,
                ...selectedWorkflow.statuses.slice(statusIndex + 1),
              ],
            },
          }),
        );
      }
    },
    async createWorkflow(projectId: string, workflowName: Pick<Workflow, "name">) {
      const workflow = await lastValueFrom(workflowService.create(projectId, workflowName));
      patchState(store, addEntity(workflow));
      return workflow;
    },
  })),
  withMethods((store, workflowService = inject(WorkflowInfraService)) => ({
    async createStatus(projectId: string, status: Pick<Status, "name" | "color">) {
      const selectedWorkflow = store.selectedEntity();
      if (selectedWorkflow) {
        const newStatus = await lastValueFrom(workflowService.createStatus(projectId, selectedWorkflow.slug, status));
        store.addStatus(newStatus);
      }
    },
    async editStatus(projectId: string, status: Pick<Status, "name" | "id">) {
      const selectedWorkflow = store.selectedEntity();
      if (selectedWorkflow) {
        const editedStatus = await lastValueFrom(workflowService.editStatus(projectId, selectedWorkflow.slug, status));
        store.updateStatus(editedStatus);
      }
    },
    async deleteStatus(projectId: string, statusId: string, moveToStatus: string | undefined) {
      const selectedWorkflow = store.selectedEntity();
      if (selectedWorkflow) {
        await lastValueFrom(workflowService.deleteStatus(projectId, selectedWorkflow.slug, statusId, moveToStatus));
        store.removeStatus(statusId);
      }
    },
  })),
);

export type WorkflowStore = InstanceType<typeof WorkflowStore>;
