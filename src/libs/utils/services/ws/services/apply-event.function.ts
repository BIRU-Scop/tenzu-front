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

import { WSResponseEvent } from "../ws.model";
import { inject } from "@angular/core";
import { StoryAssign, StoryAttachment, StoryDetail, StoryReorderPayloadEvent } from "@tenzu/data/story";
import {
  NotificationEventType,
  ProjectEventType,
  ProjectInvitationEventType,
  StoryAssignmentEventType,
  StoryAttachmentEventType,
  StoryEventType,
  UserEventType,
  WorkflowEventType,
  WorkflowStatusEventType,
  WorkspaceEventType,
} from "./event-type.enum";
import { Location } from "@angular/common";
import { ProjectService } from "@tenzu/data/project";
import { Workflow, WorkflowStatusReorderPayload } from "@tenzu/data/workflow";
import { Router } from "@angular/router";
import { NotificationService } from "@tenzu/utils/services/notification";
import { UserMinimal } from "@tenzu/data/user";
import { StatusDetail } from "@tenzu/data/status";
import { AuthService } from "@tenzu/data/auth";
import { Notification, NotificationsStore } from "@tenzu/data/notifications";
import { WorkspaceService } from "@tenzu/data/workspace/workspace.service";
import { WorkflowService } from "@tenzu/data/workflow/workflow.service";
import { StoryService } from "@tenzu/data/story/story.service";
import { getStoryDetailUrl, getWorkflowUrl, getWorkspaceRootUrl, HOMEPAGE_URL } from "@tenzu/utils/functions/urls";

export function applyStoryAssignmentEvent(message: WSResponseEvent<unknown>) {
  const storyService = inject(StoryService);
  switch (message.event.type) {
    case StoryAssignmentEventType.CreateStoryAssignment: {
      const content = message.event.content as { storyAssignment: StoryAssign };
      if (
        storyService.entityMap()[content.storyAssignment.story.ref] ||
        storyService.selectedEntity()?.ref === content.storyAssignment.story.ref
      ) {
        storyService.wsAddAssign(content.storyAssignment, content.storyAssignment.story.ref);
      }
      break;
    }
    case StoryAssignmentEventType.DeleteStoryAssignment: {
      const content = message.event.content as { storyAssignment: StoryAssign };
      if (
        storyService.entityMap()[content.storyAssignment.story.ref] ||
        storyService.selectedEntity()?.ref === content.storyAssignment.story.ref
      ) {
        storyService.wsRemoveAssign(content.storyAssignment.story.ref, content.storyAssignment.user.username);
      }

      break;
    }
  }
}

export async function applyStoryEvent(message: WSResponseEvent<unknown>) {
  const workspaceService = inject(WorkspaceService);
  const projectService = inject(ProjectService);
  const storyService = inject(StoryService);
  const workflowService = inject(WorkflowService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case StoryEventType.CreateStory: {
      const content = message.event.content as { story: StoryDetail };
      storyService.add(content.story);
      break;
    }
    case StoryEventType.UpdateStory: {
      const content = message.event.content as { story: StoryDetail; updatesAttrs: (keyof StoryDetail)[] };
      const story = content.story;
      storyService.update(story);
      switch (true) {
        case content.updatesAttrs.includes("workflow"): {
          const workspace = workspaceService.selectedEntity();
          if (workspace && router.url === `/workspace/${workspace.id}/project/${story.projectId}/story/${story.ref}`) {
            await workflowService.getBySlug(story.workflow);
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
      storyService.wsReorderStoryByEvent(content.reorder);
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
      const workflow = workflowService.selectedEntity();
      const workspace = workspaceService.selectedEntity();
      storyService.wsRemoveStory(content.ref);
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

export async function applyWorkflowEvent(message: WSResponseEvent<unknown>) {
  const projectService = inject(ProjectService);
  const workspaceService = inject(WorkspaceService);
  const workflowService = inject(WorkflowService);
  const storyService = inject(StoryService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  const location = inject(Location);

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
      const content = message.event.content as {
        workflow: Workflow;
      };
      const selectedProject = projectService.selectedEntity();
      const selectedWorkflow = workflowService.selectedEntity();
      const workspace = workspaceService.selectedEntity();
      const selectedStory = storyService.selectedEntity();
      if (selectedProject && selectedProject.id === content.workflow.projectId && workspace && selectedWorkflow) {
        projectService.wsEditWorkflow(content.workflow);
        if (selectedWorkflow.id === content.workflow.id) {
          workflowService.wsEditWorkflow(content.workflow);
          const currentUrl = router.url;
          if (
            selectedProject &&
            selectedStory &&
            currentUrl === getStoryDetailUrl(selectedProject, selectedStory.ref)
          ) {
            storyService.updateWorkflowStoryDetail(content.workflow);
          } else {
            location.replaceState(getWorkflowUrl(selectedProject, content.workflow.slug));
          }

          notificationService.warning({
            title: "notification.events.edit_workflow",
            translocoTitleParams: {
              oldName: selectedWorkflow.name,
              newName: content.workflow.name,
            },
          });
        }
      }
      break;
    }

    case WorkflowEventType.DeleteWorkflow: {
      const content = message.event.content as {
        workflow: Workflow;
        targetWorkflow: Workflow;
      };
      const selectedProject = projectService.selectedEntity();
      const workspace = workspaceService.selectedEntity();
      const selectedWorkflow = workflowService.selectedEntity();
      if (selectedProject && selectedProject.id === content.workflow.projectId && workspace && selectedWorkflow) {
        projectService.wsRemoveWorkflow(content.workflow);
        workflowService.wsDeleteWorkflow(content.workflow);
        if (selectedWorkflow.id === content.workflow.id) {
          let redirectionUrl = "/404";
          if (content.targetWorkflow) {
            redirectionUrl = getWorkflowUrl(selectedProject, content.targetWorkflow.slug);
            notificationService.warning({
              title: "notification.events.delete_workflow_and_moved_content",
              translocoTitleParams: {
                workflowUrl: redirectionUrl,
                workflowName: content.targetWorkflow.name,
                name: content.workflow.name,
              },
            });
          } else if (selectedProject.workflows) {
            redirectionUrl = getWorkflowUrl(selectedProject, selectedProject.workflows[0].slug);
            notificationService.warning({
              title: "notification.events.delete_workflow",
              translocoTitleParams: {
                name: content.workflow.name,
              },
            });
          }
          // TODO: User is in story and workflow is deleted.
          // TODO: User is in story and workflow is deleted and stories are moved.
          await router.navigateByUrl(redirectionUrl);
        }
      }
      break;
    }
  }
}

export async function applyWorkflowStatusEvent(message: WSResponseEvent<unknown>) {
  const workflowService = inject(WorkflowService);
  const storyService = inject(StoryService);

  switch (message.event.type) {
    case WorkflowStatusEventType.CreateWorkflowStatus: {
      const content = message.event.content as { workflowStatus: StatusDetail };
      workflowService.wsAddStatus(content.workflowStatus);
      break;
    }
    case WorkflowStatusEventType.UpdateWorkflowStatus: {
      const content = message.event.content as { workflowStatus: StatusDetail };
      workflowService.wsUpdateStatus(content.workflowStatus);
      break;
    }
    case WorkflowStatusEventType.DeleteWorkflowStatus: {
      const content = message.event.content as { workflowStatus: StatusDetail; targetStatus: StatusDetail };
      workflowService.wsRemoveStatus(content.workflowStatus.id);
      storyService.deleteStatusGroup(content.workflowStatus.id, content.targetStatus);
      break;
    }
    case WorkflowStatusEventType.ReorderWorkflowStatus: {
      const content = message.event.content as {
        reorder: WorkflowStatusReorderPayload & { workflow: Workflow };
      };
      await workflowService.getBySlug(content.reorder.workflow);
      break;
    }
  }
}

export function applyStoryAttachmentEvent(message: WSResponseEvent<unknown>) {
  const storyService = inject(StoryService);

  switch (message.event.type) {
    case StoryAttachmentEventType.CreateStoryAttachment: {
      const content = message.event.content as { attachment: StoryAttachment; ref: number };
      storyService.wsAddAttachment(content.attachment, content.ref);
      break;
    }
    case StoryAttachmentEventType.DeleteStoryAttachment: {
      const content = message.event.content as { attachment: StoryAttachment; ref: number };
      storyService.wsRemoveAttachment(content.attachment.id);
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

export async function applyProjectInvitationEventType(message: WSResponseEvent<unknown>) {
  const workspaceService = inject(WorkspaceService);
  const router = inject(Router);

  switch (message.event.type) {
    case ProjectInvitationEventType.CreateProjectInvitation: {
      const currentWorkspace = workspaceService.selectedEntity();
      if (router.url === HOMEPAGE_URL || (currentWorkspace && router.url === getWorkspaceRootUrl(currentWorkspace))) {
        await workspaceService.list();
      }
      break;
    }
  }
}
