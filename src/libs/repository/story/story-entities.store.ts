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
import { SelectEntityId } from "@ngrx/signals/entities";
import {
  Story,
  StoryAssign,
  StoryAttachment,
  StoryDetail,
  StoryReorderPayload,
  StoryReorderPayloadEvent,
} from "./story.model";
import { Status } from "../status";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { debug } from "@tenzu/utils/functions/logging";
import { withEntityDetailStore, withEntityListFeature } from "../base";
import { Workflow } from "../workflow";
import { UserNested } from "@tenzu/repository/user";

const selectId: SelectEntityId<Story> = (story) => story.ref;
const initialState = {
  currentProjectId: null as string | null,
  currentWorkflowSlug: null as string | null,
  groupedByStatus: {} as Record<Story["statusId"], Story["ref"][]>,
};
export const StoryEntitiesSummaryStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntityListFeature<Story, typeof initialState>({ initialState, selectId }),
  withMethods((store) => ({
    setCurrentWorkflowId(projectId: string, workflowSlug: string) {
      patchState(store, { currentProjectId: projectId, currentWorkflowSlug: workflowSlug });
    },
    reorder() {
      const groupedByStatus = store.entities().reduce(
        (acc, story) => {
          const statusId = story.statusId;
          if (acc[statusId]) {
            return { ...acc, [statusId]: [...acc[statusId], story.ref] };
          }
          return { ...acc, [statusId]: [story.ref] };
        },
        {} as Record<Story["statusId"], Story["ref"][]>,
      );
      patchState(store, { groupedByStatus });
    },
  })),
  withMethods((store) => ({
    addAssign(storyAssign: StoryAssign, ref: Story["ref"]) {
      const currentAssigneeIds = store.entityMap()[ref].assigneeIds;

      // avoid the double event from user event channel and project event channel
      if (!currentAssigneeIds.find((assigneeId) => assigneeId === storyAssign.user.id)) {
        const newAssigneeIds = [storyAssign.user.id, ...store.entityMap()[ref].assigneeIds];
        store.updateEntity(ref, { assigneeIds: newAssigneeIds });
      }
    },
    removeAssign(ref: Story["ref"], userId: UserNested["id"]) {
      const removedAssigneeIds = [...store.entityMap()[ref].assigneeIds].filter((assigneeId) => assigneeId != userId);
      store.updateEntity(ref, { assigneeIds: removedAssigneeIds });
    },
    deleteStatusGroup(oldStatusId: string, newStatus: Status) {
      store.entities().forEach((story) => {
        if (story.statusId === oldStatusId) {
          store.deleteEntity(story.ref);
          store.setEntity({ ...story, statusId: newStatus.id });
        }
      });
      store.reorder();
    },
    reorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
      const storyRef = reorder.stories[0];
      if (storyRef) {
        const stories = JSON.parse(JSON.stringify(store.entities())) as Story[];
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

    dropStoryIntoStatus(event: CdkDragDrop<Status, Status, [Story, number]>, workflowSlug: Workflow["slug"]) {
      const story = event.item.data[0];
      const lastStatus = event.previousContainer.data;
      const nextStatus = event.container.data;
      const sameStatus = lastStatus.id === nextStatus.id;
      if (sameStatus && event.previousIndex === event.currentIndex) return;

      const copyGroupedByStatus = JSON.parse(JSON.stringify(store.groupedByStatus())) as Record<
        Story["statusId"],
        Story["ref"][]
      >;
      const lastArray = copyGroupedByStatus[lastStatus.id] || [];
      debug("dropStoryBetweenStatus", "story_from_lastArray", lastArray[event.previousIndex]);

      let nextArray = lastArray;
      if (sameStatus) {
        debug("dropStoryBetweenStatus", "story_from_nextArray", nextArray[event.currentIndex]);
        moveItemInArray(lastArray, event.previousIndex, event.currentIndex);
      } else {
        nextArray = copyGroupedByStatus[nextStatus.id] || [];
        debug("dropStoryBetweenStatus", "story_from_nextArray", nextArray[event.currentIndex]);

        transferArrayItem(lastArray, nextArray, event.previousIndex, event.currentIndex);
        copyGroupedByStatus[nextStatus.id] = nextArray;
        store.updateEntity(story.ref, { statusId: nextStatus.id });
      }
      copyGroupedByStatus[lastStatus.id] = lastArray;
      const payload = calculatePayloadReorder(story.ref, nextStatus.id, nextArray, event.currentIndex, workflowSlug);

      patchState(store, { groupedByStatus: { ...copyGroupedByStatus } });
      return payload;
    },
  })),
);

export const StoryDetailStore = signalStore(
  { providedIn: "root" },
  withState({ selectedStoryAttachments: [] as StoryAttachment[] }),
  withEntityDetailStore<StoryDetail>({ selectId: selectId }),
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
        const currentAssigneeIds = story.assigneeIds;
        if (!currentAssigneeIds.find((assigneeId) => assigneeId === storyAssign.user.id)) {
          const newAssigneeIds = [storyAssign.user.id, ...story.assigneeIds];
          store.update(story.ref, { assigneeIds: newAssigneeIds });
        }
      }
    },
    reorderStoryByEvent(reorder: StoryReorderPayloadEvent) {
      const selectedStoryDetails = store.item();
      const storyRef = reorder.stories[0];
      if (selectedStoryDetails?.ref === storyRef) {
        store.update(storyRef, { statusId: reorder.status.id });
      }
    },
    removeAssign(ref: Story["ref"], userId: UserNested["id"]) {
      const story = store.item();
      if (story && story.ref === ref) {
        const removedAssigneeIds = [...story.assigneeIds].filter((assigneeId) => assigneeId != userId);
        store.update(ref, { assigneeIds: removedAssigneeIds });
      }
    },
  })),
);

function calculatePayloadReorder(
  storyId: number,
  statusId: string,
  storiesRef: Story["ref"][],
  index: number,
  workflowSlug: string,
) {
  let result: StoryReorderPayload;
  if (index === storiesRef.length - 1) {
    result = {
      statusId: statusId,
      stories: [storyId],
      workflowSlug,
    };
  } else {
    result = {
      statusId: statusId,
      reorder: { place: "before", ref: storiesRef[index + 1] },
      stories: [storyId],
      workflowSlug,
    };
  }
  return result;
}
