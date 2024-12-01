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

import { WSResponseEvent } from "../ws.model";
import { inject } from "@angular/core";
import { StoryAssign, StoryAttachment, StoryDetail, StoryReorderPayloadEvent, StoryStore } from "@tenzu/data/story";
import {
  NotificationEventType,
  ProjectEventType,
  StoryAssignmentEventType,
  StoryAttachmentEventType,
  StoryEventType,
  UserEventType,
  WorkflowEventType,
  WorkflowStatusEventType,
  WorkspaceEventType,
} from "./event-type.enum";
import { ProjectService } from "@tenzu/data/project";
import { Workflow, WorkflowStatusReorderPayload, WorkflowStore } from "@tenzu/data/workflow";
import { Router } from "@angular/router";
import { NotificationService } from "@tenzu/utils/services";
import { UserMinimal } from "@tenzu/data/user";
import { StatusDetail } from "@tenzu/data/status";
import { AuthService } from "@tenzu/data/auth";
import { Notification, NotificationsStore } from "@tenzu/data/notifications";
import { WorkspaceService } from "@tenzu/data/workspace/workspace.service";

export function applyStoryAssignmentEvent(message: WSResponseEvent<unknown>) {
  const storyStore = inject(StoryStore);
  switch (message.event.type) {
    case StoryAssignmentEventType.CreateStoryAssignment: {
      const content = message.event.content as { storyAssignment: StoryAssign };
      if (
        storyStore.entityMap()[content.storyAssignment.story.ref] ||
        storyStore.selectedStoryDetails().ref === content.storyAssignment.story.ref
      ) {
        storyStore.addAssign(content.storyAssignment, content.storyAssignment.story.ref);
      }
      break;
    }
    case StoryAssignmentEventType.DeleteStoryAssignment: {
      const content = message.event.content as { storyAssignment: StoryAssign };
      if (
        storyStore.entityMap()[content.storyAssignment.story.ref] ||
        storyStore.selectedStoryDetails().ref === content.storyAssignment.story.ref
      ) {
        storyStore.removeAssign(content.storyAssignment.story.ref, content.storyAssignment.user.username);
      }

      break;
    }
  }
}

export async function applyStoryEvent(message: WSResponseEvent<unknown>) {
  const workspaceService = inject(WorkspaceService);
  const projectService = inject(ProjectService);
  const storyStore = inject(StoryStore);
  const workflowStore = inject(WorkflowStore);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case StoryEventType.CreateStory: {
      const content = message.event.content as { story: StoryDetail };
      storyStore.add(content.story);
      break;
    }
    case StoryEventType.UpdateStory: {
      const content = message.event.content as { story: StoryDetail; updatesAttrs: (keyof StoryDetail)[] };
      const story = content.story;
      storyStore.update(story);
      switch (true) {
        case content.updatesAttrs.includes("workflow"): {
          const workspace = workspaceService.selectedEntity();
          if (workspace && router.url === `/workspace/${workspace.id}/project/${story.projectId}/story/${story.ref}`) {
            await workflowStore.refreshWorkflow(story.workflow);
            workflowStore.selectWorkflow(story.workflowId);
          }
          if (
            workspace &&
            (router.url === `/workspace/${workspace.id}/project/${story.projectId}/story/${story.ref}` ||
              router.url.includes(`/workspace/${workspace.id}/project/${story.projectId}/kanban`))
          ) {
            notificationService.info({
              title: "notification.events.move_story_to_workflow",
              translocoTitleParams: {
                workflowURL: `/workspace/${workspace.id}/project/${story.projectId}/kanban/${story.workflow.slug}`,
                workflowName: content.story.workflow.name,
              },
            });
          }
        }
      }
      break;
    }
    case StoryEventType.ReorderStory: {
      const content = message.event.content as {
        reorder: StoryReorderPayloadEvent;
      };
      storyStore.reorderStoryByEvent(content.reorder);
      break;
    }
    case StoryEventType.DeleteStory: {
      const content = message.event.content as {
        ref: number;
        deletedBy: {
          color: number;
          fullName: string;
          username: string;
        };
      };
      const project = projectService.selectedEntity();
      const workflow = workflowStore.selectedEntity();
      const workspace = workspaceService.selectedEntity();
      storyStore.removeStory(content.ref);
      if (router.url === `/workspace/${workspace?.id}/project/${project?.id}/story/${content.ref}`) {
        await router.navigateByUrl(`/workspace/${workspace?.id}/project/${project?.id}/kanban/${workflow?.slug}`);
        notificationService.warning({
          title: "notification.events.delete_story",
          translocoTitleParams: {
            username: content.deletedBy.username,
            ref: content.ref,
          },
        });
      }
      break;
    }
  }
}

export function applyWorkflowEvent(message: WSResponseEvent<unknown>) {
  const projectService = inject(ProjectService);

  switch (message.event.type) {
    case WorkflowEventType.CreateWorkflow: {
      const content = message.event.content as { workflow: Workflow };
      const project = projectService.selectedEntity();
      if (project && project.id === content.workflow.projectId) {
        projectService.wsAddWorkdlow(content.workflow);
      }
      break;
    }
    case WorkflowEventType.UpdateWorkflow: {
      break;
    }
    case WorkflowEventType.DeleteWorkflow: {
      break;
    }
  }
}

export async function applyWorkflowStatusEvent(message: WSResponseEvent<unknown>) {
  const workflowStore = inject(WorkflowStore);
  const storyStore = inject(StoryStore);

  switch (message.event.type) {
    case WorkflowStatusEventType.CreateWorkflowStatus: {
      const content = message.event.content as { workflowStatus: StatusDetail };
      workflowStore.addStatus(content.workflowStatus);
      break;
    }
    case WorkflowStatusEventType.UpdateWorkflowStatus: {
      const content = message.event.content as { workflowStatus: StatusDetail };
      workflowStore.updateStatus(content.workflowStatus);
      break;
    }
    case WorkflowStatusEventType.DeleteWorkflowStatus: {
      const content = message.event.content as { workflowStatus: StatusDetail; targetStatus: StatusDetail };
      workflowStore.removeStatus(content.workflowStatus.id);
      storyStore.deleteStatusGroup(content.workflowStatus.id, content.targetStatus);
      break;
    }
    case WorkflowStatusEventType.ReorderWorkflowStatus: {
      const content = message.event.content as {
        reorder: WorkflowStatusReorderPayload & { workflow: Workflow };
      };
      await workflowStore.refreshWorkflow(content.reorder.workflow);
      break;
    }
  }
}

export function applyStoryAttachmentEvent(message: WSResponseEvent<unknown>) {
  const storyStore = inject(StoryStore);

  switch (message.event.type) {
    case StoryAttachmentEventType.CreateStoryAttachment: {
      const content = message.event.content as { attachment: StoryAttachment; ref: number };
      storyStore.addAttachment(content.attachment, content.ref);
      break;
    }
    case StoryAttachmentEventType.DeleteStoryAttachment: {
      const content = message.event.content as { attachment: StoryAttachment; ref: number };
      storyStore.removeAttachment(content.attachment.id);
      break;
    }
  }
}

export async function applyProjectEvent(message: WSResponseEvent<unknown>) {
  const projectService = inject(ProjectService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case ProjectEventType.ProjectDelete: {
      const content = message.event.content as {
        deletedBy: UserMinimal;
        project: string;
        workspace: string;
        name: string;
      };
      const currentProject = projectService.selectedEntity();
      projectService.wsRemoveEntity(content.project);
      if (currentProject && currentProject.id === content.project) {
        await router.navigateByUrl("/");
        projectService.resetSelectedEntity();
      }
      notificationService.warning({
        title: "notification.events.delete_project",
        translocoTitleParams: {
          username: content.deletedBy.username,
          name: content.name,
        },
      });
      break;
    }
  }
}

export async function applyWorkspaceEvent(message: WSResponseEvent<unknown>) {
  const workspaceService = inject(WorkspaceService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const content = message.event.content as { deletedBy: UserMinimal; workspace: string; name: string };

  switch (message.event.type) {
    case WorkspaceEventType.WorkspaceDelete: {
      const currentWorkspace = workspaceService.selectedEntity();
      workspaceService.wsRemoveEntity(content.workspace);
      if (currentWorkspace && currentWorkspace.id === content.workspace) {
        await router.navigateByUrl("/");
        workspaceService.resetSelectedEntity();
      }
      notificationService.warning({
        title: "notification.events.delete_workspace",
        translocoTitleParams: {
          username: content.deletedBy.username,
          name: content.name,
        },
      });
      break;
    }
  }
}

export async function applyUserEvent(message: WSResponseEvent<unknown>) {
  const authService = inject(AuthService);
  switch (message.event.type) {
    case UserEventType.DeleteUser: {
      await authService.logout();
    }
  }
}
export function applyNotificationEvent(message: WSResponseEvent<unknown>) {
  const notificationsStore = inject(NotificationsStore);
  switch (message.event.type) {
    case NotificationEventType.CreateNotification: {
      const notifications = notificationsStore.entities();
      const content = message.event.content as { notification: Notification };
      notificationsStore.setNotifications([content.notification, ...notifications]);
      notificationsStore.increaseUnreadCount();
      break;
    }
    case NotificationEventType.ReadNotifications: {
      const content = message.event.content as { notificationsIds: string[] };
      content.notificationsIds.map((id) => {
        notificationsStore.markReadEvent(id);
        notificationsStore.decreaseUnreadCount();
      });
      break;
    }
  }
}
