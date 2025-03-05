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

import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import {
  addEntities,
  EntityId,
  removeAllEntities,
  removeEntity,
  SelectEntityId,
  setAllEntities,
  setEntity,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { withMethodEntity } from "../../utils/store/store-features";
import {
  Story,
  StoryAssign,
  StoryAttachment,
  StoryDetail,
  StoryReorderPayload,
  StoryReorderPayloadEvent,
} from "@tenzu/data/story/story.model";
import { Status } from "@tenzu/data/status";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";

const selectId: SelectEntityId<Story> = (story) => story.ref;
const initialState = {
  currentProjectId: null as string | null,
  currentWorkflowSlug: null as string | null,
  orderStoryByStatus: {} as Record<string, number[]>,
};
export const StoryStore = signalStore(
  { providedIn: "root" },
  withEntities<Story>(),
  withState(initialState),
  withComputed(({ entityMap, orderStoryByStatus }) => ({
    groupedByStatus: computed(() => {
      const orderStoryByStatusTemp = orderStoryByStatus();
      const result = {} as Record<string, Story[]>;
      for (const [statusId, storiesId] of Object.entries(orderStoryByStatusTemp)) {
        result[statusId] = storiesId.map((storyId) => entityMap()[storyId]);
      }
      return result;
    }),
  })),
  withMethods((store) => ({
    setCurrentWorkflowId(projectId: string, workflowSlug: string) {
      patchState(store, { currentProjectId: projectId, currentWorkflowSlug: workflowSlug });
    },
    addEntities(items: Story[]) {
      patchState(store, addEntities(items, { selectId }));
    },
    setAllEntities(entities: Story[]) {
      patchState(store, setAllEntities(entities, { selectId }));
    },
    setEntity(entity: Story) {
      patchState(store, setEntity(entity, { selectId }));
    },
    updateEntity(ref: number, change: Partial<Story>) {
      patchState(store, updateEntity({ id: ref, changes: { ...change } }, { selectId }));
    },
    removeEntity(selectedEntityId: EntityId) {
      patchState(store, removeEntity(selectedEntityId));
    },
    reset() {
      patchState(store, removeAllEntities());
      patchState(store, initialState);
    },
    reorder() {
      const orderStoryByStatus = store.entities().reduce(
        (acc, story) => {
          const statusId = story.statusId;
          if (acc[statusId]) {
            return { ...acc, [statusId]: [...acc[statusId], story.ref] };
          }
          return { ...acc, [statusId]: [story.ref] };
        },
        {} as Record<string, number[]>,
      );
      patchState(store, { orderStoryByStatus: { ...orderStoryByStatus } });
    },
  })),
  withMethods((store) => ({
    list(stories: Story[]) {
      store.addEntities(stories);
      return stories;
    },

    add(story: Story) {
      store.setEntity(story);
      store.reorder();
    },
    update(story: StoryDetail) {
      const { ref, ...change } = story;
      store.updateEntity(ref, change);
      store.reorder();
      return story;
    },

    removeStory(ref: number) {
      store.removeEntity(ref);
      store.reorder();
    },
    addAssign(storyAssign: StoryAssign, ref: number) {
      const currentAssignees = store.entityMap()[ref].assignees;
      // avoid the double event from user event channel and project event channel
      if (!currentAssignees.find((assignee) => assignee.username === storyAssign.user.username)) {
        const newAssignees = [storyAssign.user, ...store.entityMap()[ref].assignees];
        store.updateEntity(ref, { assignees: newAssignees });
      }
    },
    removeAssign(ref: number, username: string) {
      const removedAssign = [...store.entityMap()[ref].assignees].filter((assignee) => assignee.username != username);
      store.updateEntity(ref, { assignees: removedAssign });
    },
    deleteStatusGroup(oldStatusId: string, newStatus: Status) {
      store.entities().forEach((story) => {
        if (story.statusId === oldStatusId) {
          store.removeEntity(story.ref);
          store.setEntity({ ...story, statusId: newStatus.id });
        }
      });
      store.reorder();
    },
    reorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
      const storyRef = reorder.stories[0];
      if (storyRef) {
        const stories = store.entities();
        const currentStatusIndex = stories.findIndex((story) => story.ref === storyRef);
        const siblingStoryRef = reorder.reorder?.ref;
        if (siblingStoryRef) {
          const siblingStoryIndex = stories.findIndex((story) => story.ref === siblingStoryRef);
          if (reorder.reorder?.place === "after") {
            moveItemInArray(stories, currentStatusIndex, siblingStoryIndex + 1);
          } else if (reorder.reorder?.place === "before") {
            moveItemInArray(stories, currentStatusIndex, siblingStoryIndex - 1);
          }
          // if no place, nothing to do
        }
        store.setAllEntities(stories);
        store.updateEntity(storyRef, { statusId: reorder.status.id });
        store.reorder();
      }
    },

    dropStoryIntoSameStatus(event: CdkDragDrop<Status, Status, Story>) {
      if (event.previousIndex === event.currentIndex) return;

      const story = event.item.data;
      const status = event.container.data;
      const copyOrderStoryByStatus = JSON.parse(JSON.stringify(store.orderStoryByStatus()));
      const stories = copyOrderStoryByStatus[event.item.data.statusId];

      moveItemInArray(stories, event.previousIndex, event.currentIndex);
      copyOrderStoryByStatus[event.item.data.statusId] = stories;
      const payload = calculatePayloadReorder(story.ref, status.id, stories, event.currentIndex);
      patchState(store, { orderStoryByStatus: { ...copyOrderStoryByStatus } });
      return payload;
    },
    dropStoryBetweenStatus(event: CdkDragDrop<Status, Status, Story>) {
      const story = event.item.data;
      const lastStatus = event.previousContainer.data;
      const nextStatus = event.container.data;
      const copyOrderStoryByStatus = JSON.parse(JSON.stringify(store.orderStoryByStatus()));
      const lastArray = copyOrderStoryByStatus[lastStatus.id] || [];
      const nextArray = copyOrderStoryByStatus[nextStatus.id] || [];
      transferArrayItem(lastArray, nextArray, event.previousIndex, event.currentIndex);
      copyOrderStoryByStatus[lastStatus.id] = lastArray;
      copyOrderStoryByStatus[nextStatus.id] = nextArray;
      const payload = calculatePayloadReorder(story.ref, nextStatus.id, nextArray, event.currentIndex);

      patchState(store, { orderStoryByStatus: { ...copyOrderStoryByStatus } });
      store.updateEntity(story.ref, { statusId: nextStatus.id });
      return payload;
    },
  })),
);

export const StoryDetailStore = signalStore(
  { providedIn: "root" },
  withState({ selectedStoryAttachments: [] as StoryAttachment[] }),
  withMethodEntity<StoryDetail>(),
  withMethods((store) => ({
    setStoryAttachments: (attachments: StoryAttachment[]) => {
      patchState(store, { selectedStoryAttachments: attachments });
    },
    addAttachment(newAttachment: StoryAttachment, ref: number) {
      if (store.item()?.ref === ref) {
        patchState(store, { selectedStoryAttachments: [...store.selectedStoryAttachments(), newAttachment] });
      }
      return newAttachment;
    },
    removeAttachment(attachmentId: string) {
      patchState(store, {
        selectedStoryAttachments: store
          .selectedStoryAttachments()
          .filter((attachment) => attachment.id !== attachmentId),
      });
    },
    resetOverride() {
      store.reset();
      patchState(store, { selectedStoryAttachments: [] });
    },
    addAssign(storyAssign: StoryAssign) {
      const story = store.item();

      if (story && story.ref === storyAssign.story.ref) {
        const currentAssignees = story.assignees;
        if (!currentAssignees.find((assignee) => assignee.username === storyAssign.user.username)) {
          const newAssignees = [storyAssign.user, ...story.assignees];
          store.patch({ assignees: newAssignees });
        }
      }
    },
    reorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
      const selectedStoryDetails = store.item();
      const storyRef = reorder.stories[0];
      if (selectedStoryDetails?.ref === storyRef) {
        store.patch({ statusId: reorder.status.id });
      }
    },
    removeAssign(ref: number, username: string) {
      const story = store.item();
      if (story && story.ref === ref) {
        const removedAssign = [...story.assignees].filter((assignee) => assignee.username != username);
        store.patch({ assignees: removedAssign });
      }
    },
  })),
);

function calculatePayloadReorder(storyId: number, statusId: string, storiesId: number[], index: number) {
  let result: StoryReorderPayload;
  if (storiesId.length === 1) {
    result = {
      statusId: statusId,
      stories: [storyId],
    };
  } else if (index === storiesId.length - 1) {
    result = {
      statusId: statusId,
      reorder: { place: "after", ref: storiesId[index - 1] },
      stories: [storyId],
    };
  } else {
    result = {
      statusId: statusId,
      reorder: { place: "before", ref: storiesId[index + 1] },
      stories: [storyId],
    };
  }
  return result;
}

export type StoryDetailStore = InstanceType<typeof StoryDetailStore>;
export type StoryStore = InstanceType<typeof StoryStore>;
