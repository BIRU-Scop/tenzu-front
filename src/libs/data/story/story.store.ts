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
  StoryReorder,
  StoryReorderPayloadEvent,
} from "@tenzu/data/story/story.model";
import { Status } from "@tenzu/data/status";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { debug } from "@tenzu/utils/functions/logging";

const selectId: SelectEntityId<Story> = (story) => story.ref;
const initialState = {
  currentProjectId: null as string | null,
  currentWorkflowSlug: null as string | null,
  groupedByStatus: {} as Record<string, Story[]>,
};
export const StoryStore = signalStore(
  { providedIn: "root" },
  withEntities<Story>(),
  withState(initialState),
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
      const groupedByStatus = store.entities().reduce(
        (acc, story) => {
          const statusId = story.statusId;
          if (acc[statusId]) {
            return { ...acc, [statusId]: [...acc[statusId], story] };
          }
          return { ...acc, [statusId]: [story] };
        },
        {} as Record<string, Story[]>,
      );
      patchState(store, { groupedByStatus });
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
        const currentIndex = stories.findIndex((story) => story.ref === storyRef);
        stories[currentIndex].statusId = reorder.status.id;
        const siblingStoryRef = reorder.reorder?.ref;
        if (siblingStoryRef) {
          const siblingStoryIndex = stories.findIndex((story) => story.ref === siblingStoryRef);
          if (reorder.reorder?.place === "after") {
            moveItemInArray(stories, currentIndex, siblingStoryIndex + 1);
          } else if (reorder.reorder?.place === "before") {
            moveItemInArray(stories, currentIndex, siblingStoryIndex - 1);
          }
          // if no place, nothing to do
        }
        store.setAllEntities(stories);
        store.reorder();
      }
    },

    dropStoryIntoStatus(
      event: CdkDragDrop<Status, Status, [Story, number]>,
      reorderPlacement: StoryReorder | undefined,
    ) {
      const story = event.item.data[0];
      const lastStatus = event.previousContainer.data;
      const nextStatus = event.container.data;
      const sameStatus = lastStatus.id === nextStatus.id;
      if (sameStatus && event.previousIndex === event.currentIndex) return;

      const copyGroupedByStatus = JSON.parse(JSON.stringify(store.groupedByStatus()));
      const lastArray = copyGroupedByStatus[lastStatus.id] || [];
      debug("dropStoryBetweenStatus", "story_from_lastArray", lastArray[event.previousIndex]);

      if (sameStatus) {
        moveItemInArray(lastArray, event.previousIndex, event.currentIndex);
      } else {
        const nextArray = copyGroupedByStatus[nextStatus.id] || [];
        debug("dropStoryBetweenStatus", "story_from_nextArray", nextArray[event.currentIndex]);

        transferArrayItem(lastArray, nextArray, event.previousIndex, event.currentIndex);
        copyGroupedByStatus[nextStatus.id] = nextArray;
        store.updateEntity(story.ref, { statusId: nextStatus.id });
      }
      copyGroupedByStatus[lastStatus.id] = lastArray;
      const payload = {
        statusId: nextStatus.id,
        stories: [story.ref],
        reorder: reorderPlacement,
      };

      patchState(store, { groupedByStatus: { ...copyGroupedByStatus } });
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

export type StoryDetailStore = InstanceType<typeof StoryDetailStore>;
export type StoryStore = InstanceType<typeof StoryStore>;
