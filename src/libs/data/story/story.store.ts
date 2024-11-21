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
import {
  addEntities,
  addEntity,
  removeAllEntities,
  removeEntity,
  SelectEntityId,
  setAllEntities,
  setEntity,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { setLoadingBegin, setLoadingEnd, withLoadingStatus } from "../../utils/store/store-features";
import {
  Story,
  StoryAssign,
  StoryAttachment,
  StoryCreate,
  StoryDetail,
  StoryReorderPayload,
  StoryReorderPayloadEvent, StoryUpdate
} from "@tenzu/data/story/story.model";
import { StoryService } from "@tenzu/data/story/story.service";
import { lastValueFrom } from "rxjs";
import { Status } from "@tenzu/data/status";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";

const selectId: SelectEntityId<Story> = (story) => story.ref;

export const StoryStore = signalStore(
  { providedIn: "root" },
  withEntities<Story>(),
  withState({
    selectedStoryDetails: {} as StoryDetail,
    orderStoryByStatus: {} as Record<string, number[]>,
    selectedStoryAttachments: [] as StoryAttachment[],
  }),
  withLoadingStatus(),
  withComputed(({ entityMap, orderStoryByStatus }) => ({
    groupedByStatus: computed(() => {
      const result = {} as Record<string, Story[]>;
      for (const [statusId, storiesId] of Object.entries(orderStoryByStatus())) {
        result[statusId] = storiesId.map((storyId) => entityMap()[storyId]);
      }
      return result;
    }),
  })),
  withMethods((store) => ({
    reorder() {
      const orderStoryByStatus = store.entities().reduce(
        (acc, story) => {
          const statusId = story.status.id;
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
  withMethods((store, storyService = inject(StoryService)) => ({
    resetList() {
      patchState(store, removeAllEntities());
    },
    async list(projectId: string, workflowSlug: string, offset: number, limit: number) {
      patchState(store, setLoadingBegin());
      const stories = await lastValueFrom(storyService.getStories(projectId, workflowSlug, limit, offset));
      patchState(store, addEntities(stories, { selectId }));
      patchState(store, setLoadingEnd());
      return stories;
    },

    add(story: Story) {
      patchState(store, setEntity(story, { selectId }));
      store.reorder();
    },
    async get(projectId: string, ref: number) {
      const story = await lastValueFrom(storyService.get(projectId, ref));
      const attachments = await lastValueFrom(storyService.getAttachments(projectId, ref));
      patchState(store, setEntity(story as Story, { selectId }));
      patchState(store, { selectedStoryDetails: story, selectedStoryAttachments: attachments });
      return story;
    },
    update(story: StoryDetail) {
      const { ref, ...change } = story;
      patchState(store, updateEntity({ id: ref, changes: { ...change } }, { selectId }));
      if (store.selectedStoryDetails().ref === story.ref) {
        patchState(store, { selectedStoryDetails: story });
      }
      store.reorder();
      return story;
    },
    addAttachment(newAttachment: StoryAttachment, ref: number) {
      if (store.selectedStoryDetails().ref === ref) {
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
    removeStory(ref: number) {
      patchState(store, removeEntity(ref));
      patchState(store, { selectedStoryAttachments: [] });
      if (ref === store.selectedStoryDetails().ref) {
        patchState(store, { selectedStoryDetails: {} as StoryDetail });
      }
      store.reorder();
    },
    addAssign(storyAssign: StoryAssign, ref: number) {
      const currentAssignees = store.entityMap()[ref].assignees;
      // avoid the double event from user event channel and project event channel
      if (!currentAssignees.find((assignee) => assignee.username === storyAssign.user.username)) {
        const newAssignees = [storyAssign.user, ...store.entityMap()[ref].assignees];
        patchState(store, updateEntity({ id: ref, changes: { assignees: newAssignees } }, { selectId }));
        if (store.selectedStoryDetails().ref === ref) {
          patchState(store, (state) => ({
            selectedStoryDetails: {
              ...state.selectedStoryDetails,
              assignees: newAssignees,
            },
          }));
        }
      }
    },
    removeAssign(ref: number, username: string) {
      const removedAssign = [...store.entityMap()[ref].assignees].filter((assignee) => assignee.username != username);
      patchState(store, updateEntity({ id: ref, changes: { assignees: removedAssign } }, { selectId }));
      if (store.selectedStoryDetails().ref === ref) {
        patchState(store, (state) => ({
          selectedStoryDetails: {
            ...state.selectedStoryDetails,
            assignees: removedAssign,
          },
        }));
      }
    },
    deleteStatusGroup(oldStatusId: string, newStatus: Status) {
      store.entities().forEach((story) => {
        if (story.status.id === oldStatusId) {
          patchState(store, removeEntity(story.ref), addEntity({ ...story, status: newStatus }, { selectId }));
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
        patchState(store, setAllEntities(stories, { selectId }));
        patchState(store, updateEntity({ id: storyRef, changes: { status: reorder.status } }, { selectId }));
        store.reorder();
        const selectedStoryDetails = store.selectedStoryDetails();
        if (selectedStoryDetails.ref === storyRef) {
          patchState(store, { selectedStoryDetails: { ...selectedStoryDetails, status: reorder.status } });
        }
      }
    },

    async dropStoryIntoSameStatus(event: CdkDragDrop<Status, Status, Story>, projectId: string, workflowSlug: string) {
      const story = event.item.data;
      const status = event.container.data;
      const copyOrderStoryByStatus = store.orderStoryByStatus();
      const stories = copyOrderStoryByStatus[event.item.data.status.id];
      moveItemInArray(stories, event.previousIndex, event.currentIndex);
      copyOrderStoryByStatus[event.item.data.status.id] = stories;
      const payload = calculatePayloadReorder(story.ref, status.id, stories, event.currentIndex);
      patchState(store, { orderStoryByStatus: { ...copyOrderStoryByStatus } });
      await lastValueFrom(storyService.reorder(projectId, workflowSlug, payload));
    },
    async dropStoryBetweenStatus(event: CdkDragDrop<Status, Status, Story>, projectId: string, workflowSlug: string) {
      const story = event.item.data;
      const lastStatus = event.previousContainer.data;
      const nextStatus = event.container.data;
      const copyOrderStoryByStatus = store.orderStoryByStatus();
      const lastArray = copyOrderStoryByStatus[lastStatus.id] || [];
      const nextArray = copyOrderStoryByStatus[nextStatus.id] || [];
      transferArrayItem(lastArray, nextArray, event.previousIndex, event.currentIndex);
      copyOrderStoryByStatus[lastStatus.id] = lastArray;
      copyOrderStoryByStatus[nextStatus.id] = nextArray;
      const payload = calculatePayloadReorder(story.ref, nextStatus.id, nextArray, event.currentIndex);

      patchState(store, { orderStoryByStatus: { ...copyOrderStoryByStatus } });
      story.status = nextStatus;
      patchState(store, updateEntity({ id: story.ref, changes: { status: { ...nextStatus } } }, { selectId }));
      await lastValueFrom(storyService.reorder(projectId, workflowSlug, payload));
    },
  })),
  withMethods((store, storyService = inject(StoryService)) => ({
    async create(projectId: string, workflowSlug: string, Story: StoryCreate) {
      const newStory = await lastValueFrom(storyService.create(projectId, workflowSlug, Story));
      store.add(newStory);
    },
    async patch(projectId: string, story: StoryDetail, data: StoryUpdate) {
      const storyPatched = await lastValueFrom(storyService.patch(projectId, data));
      store.update(storyPatched);
      return storyPatched;
    },
    async deleteStory(projectId: string, ref: number) {
      await lastValueFrom(storyService.deleteStory(projectId, ref));
      store.removeStory(ref);
    },
    async createAssign(projectId: string, ref: number, username: string) {
      const storyAssign: StoryAssign = await lastValueFrom(storyService.createAssignee(projectId, ref, username));
      store.addAssign(storyAssign, ref);
    },
    async deleteAssign(projectId: string, ref: number, username: string) {
      await lastValueFrom(storyService.deleteAssignee(projectId, ref, username));
      store.removeAssign(ref, username);
    },
    async createAttachment(projectId: string, ref: number, attachment: Blob) {
      const newAttachment = await lastValueFrom(storyService.addStoryAttachments(projectId, ref, attachment));
      store.addAttachment(newAttachment, ref);
    },
    async deleteAttachment(projectId: string, ref: number, attachmentId: string) {
      await lastValueFrom(storyService.deleteStoryAttachment(projectId, ref, attachmentId));
      store.removeAttachment(attachmentId);
    },
  })),
);

function calculatePayloadReorder(storyId: number, statusId: string, storiesId: number[], index: number) {
  let result: StoryReorderPayload;
  if (storiesId.length === 1) {
    result = {
      status: statusId,
      stories: [storyId],
    };
  } else if (index === storiesId.length - 1) {
    result = {
      status: statusId,
      reorder: { place: "after", ref: storiesId[index - 1] },
      stories: [storyId],
    };
  } else {
    result = {
      status: statusId,
      reorder: { place: "before", ref: storiesId[index + 1] },
      stories: [storyId],
    };
  }
  return result;
}
export type StoryStore = InstanceType<typeof StoryStore>;
