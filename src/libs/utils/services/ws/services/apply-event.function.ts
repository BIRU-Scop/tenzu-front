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
import { StoryAssign, StoryDetail, StoryReorderPayloadEvent } from "@tenzu/repository/story";
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
  WorkspaceInvitationEventType,
} from "./event-type.enum";
import { Location } from "@angular/common";
import { ProjectRepositoryService, ProjectDetail } from "@tenzu/repository/project";
import { Workflow, ReorderWorkflowStatusesPayload, WorkflowNested } from "@tenzu/repository/workflow";
import { Router } from "@angular/router";
import { NotificationService } from "@tenzu/utils/services/notification";
import { UserNested } from "@tenzu/repository/user";
import { StatusDetail } from "@tenzu/repository/status";
import { AuthService } from "@tenzu/repository/auth";
import { Notification, NotificationsStore } from "@tenzu/repository/notifications";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow/workflow-repository.service";
import { StoryRepositoryService } from "@tenzu/repository/story/story-repository.service";
import {
  getProjectMembersRootUrl,
  getStoryDetailUrl,
  getWorkflowUrl,
  getWorkspaceMembersRootUrl,
  getWorkspaceProjectsUrl,
  HOMEPAGE_URL,
} from "@tenzu/utils/functions/urls";
import { StoryAttachment, StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment";
import { WorkspaceDetail } from "@tenzu/repository/workspace";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import { WorkspaceMembershipRepositoryService } from "@tenzu/repository/workspace-membership";
import { ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";

export function applyStoryAssignmentEvent(message: WSResponseEvent<unknown>) {
  const storyService = inject(StoryRepositoryService);
  switch (message.event.type) {
    case StoryAssignmentEventType.CreateStoryAssignment: {
      const content = message.event.content as { storyAssignment: StoryAssign };
      if (
        storyService.entityMapSummary()[content.storyAssignment.story.ref] ||
        storyService.entityDetail()?.ref === content.storyAssignment.story.ref
      ) {
        storyService.wsAddAssign(content.storyAssignment, content.storyAssignment.story.ref);
      }
      break;
    }
    case StoryAssignmentEventType.DeleteStoryAssignment: {
      const content = message.event.content as { storyAssignment: StoryAssign };
      if (
        storyService.entityMapSummary()[content.storyAssignment.story.ref] ||
        storyService.entityDetail()?.ref === content.storyAssignment.story.ref
      ) {
        storyService.wsRemoveAssign(content.storyAssignment.story.ref, content.storyAssignment.user.id);
      }

      break;
    }
  }
}

export async function applyStoryEvent(message: WSResponseEvent<unknown>) {
  const workspaceService = inject(WorkspaceRepositoryService);
  const projectService = inject(ProjectRepositoryService);
  const storyService = inject(StoryRepositoryService);
  const workflowService = inject(WorkflowRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case StoryEventType.CreateStory: {
      const content = message.event.content as { story: StoryDetail };
      storyService.setEntitySummary(content.story);
      break;
    }
    case StoryEventType.UpdateStory: {
      const content = message.event.content as { story: StoryDetail; updatesAttrs: (keyof StoryDetail)[] };
      const story = content.story;
      storyService.updateEntityDetail(story);
      switch (true) {
        case content.updatesAttrs.includes("workflow"): {
          const workspace = workspaceService.entityDetail();
          if (workspace && router.url === `/workspace/${workspace.id}/project/${story.projectId}/story/${story.ref}`) {
            await workflowService.getRequest({ workflowId: story.workflow.id });
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
      const project = projectService.entityDetail();
      const workflow = workflowService.entityDetail();
      const workspace = workspaceService.entityDetail();
      const story =
        storyService.entityMapSummary()[content.ref] || storyService.entityDetail()?.ref === content.ref
          ? storyService.entityDetail()
          : undefined;
      if (story) {
        storyService.deleteEntityDetail(story);
      }
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
  const projectService = inject(ProjectRepositoryService);
  const workspaceService = inject(WorkspaceRepositoryService);
  const workflowService = inject(WorkflowRepositoryService);
  const storyService = inject(StoryRepositoryService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  const location = inject(Location);

  switch (message.event.type) {
    case WorkflowEventType.CreateWorkflow: {
      const content = message.event.content as { workflow: Workflow };
      const project = projectService.entityDetail();
      if (project && project.id === content.workflow.projectId) {
        projectService.addWorkflow(content.workflow);
      }
      break;
    }
    case WorkflowEventType.UpdateWorkflow: {
      const content = message.event.content as {
        workflow: Workflow;
      };
      const selectedProject = projectService.entityDetail();
      const selectedWorkflow = workflowService.entityDetail();
      const workspace = workspaceService.entityDetail();
      const selectedStory = storyService.entityDetail();
      if (selectedProject && selectedProject.id === content.workflow.projectId && workspace && selectedWorkflow) {
        projectService.editWorkflow(content.workflow);
        if (selectedWorkflow.id === content.workflow.id) {
          workflowService.updateEntityDetail(content.workflow);
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
      const selectedProject = projectService.entityDetail();
      const workspace = workspaceService.entityDetail();
      const selectedWorkflow = workflowService.entityDetail();
      if (selectedProject && selectedProject.id === content.workflow.projectId && workspace && selectedWorkflow) {
        projectService.removeWorkflow(content.workflow);
        workflowService.deleteEntityDetail(content.workflow);
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
  const workflowService = inject(WorkflowRepositoryService);
  const storyService = inject(StoryRepositoryService);

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
        reorder: ReorderWorkflowStatusesPayload & { workflow: WorkflowNested };
      };
      await workflowService.getRequest({ workflowId: content.reorder.workflow.id });
      break;
    }
  }
}

export function applyStoryAttachmentEvent(message: WSResponseEvent<unknown>) {
  const storyAttachmentRepositoryService = inject(StoryAttachmentRepositoryService);
  const storyRepositoryService = inject(StoryRepositoryService);
  const currentStoryDetail = storyRepositoryService.entityDetail();
  switch (message.event.type) {
    case StoryAttachmentEventType.CreateStoryAttachment: {
      const content = message.event.content as { attachment: StoryAttachment; ref: number };
      if (currentStoryDetail?.ref === content.ref) {
        storyAttachmentRepositoryService.setEntitySummary(content.attachment);
      }
      break;
    }
    case StoryAttachmentEventType.DeleteStoryAttachment: {
      const content = message.event.content as { attachment: StoryAttachment; ref: number };
      if (currentStoryDetail?.ref === content.ref) {
        storyAttachmentRepositoryService.deleteEntitySummary(content.attachment.id);
      }
      break;
    }
  }
}

export async function applyProjectEvent(message: WSResponseEvent<unknown>) {
  const projectService = inject(ProjectRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case ProjectEventType.DeleteProject: {
      const content = message.event.content as {
        deletedBy: UserNested;
        project: string;
        workspace: string;
        name: string;
      };
      const currentProject = projectService.entityDetail();
      projectService.deleteEntitySummary(content.project);
      if (currentProject && currentProject.id === content.project) {
        await router.navigateByUrl("/");
        projectService.deleteEntityDetail(currentProject);
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
    case ProjectEventType.UpdateProject: {
      const content = message.event.content as { project: ProjectDetail; updatedBy: UserNested };
      const project = content.project;

      const currentProject = projectService.entityDetail();

      const projectIsAlreadyUpdated = JSON.stringify(currentProject) == JSON.stringify(project);

      if (!projectIsAlreadyUpdated) {
        projectService.updateEntityDetail(project);
        notificationService.info({
          title: "notification.events.update_project",
          translocoTitleParams: {
            username: content.updatedBy?.fullName,
            name: content.project.name,
          },
        });
      }
      break;
    }
  }
}

export async function applyWorkspaceEvent(message: WSResponseEvent<unknown>) {
  const workspaceService = inject(WorkspaceRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const content = message.event.content as { deletedBy: UserNested; workspace: string; name: string };

  switch (message.event.type) {
    case WorkspaceEventType.DeleteWorkspace: {
      const currentWorkspace = workspaceService.entityDetail();
      workspaceService.deleteEntitySummary(content.workspace);
      if (currentWorkspace && currentWorkspace.id === content.workspace) {
        await router.navigateByUrl("/");
        workspaceService.deleteEntityDetail(currentWorkspace);
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
    case WorkspaceEventType.UpdateWorkspace: {
      const content = message.event.content as { workspace: WorkspaceDetail; updatedBy: UserNested };
      const workspace = content.workspace;

      const currentProject = workspaceService.entityDetail();

      const workspaceIsAlreadyUpdated = JSON.stringify(currentProject) == JSON.stringify(workspace);

      if (!workspaceIsAlreadyUpdated) {
        workspaceService.updateEntityDetail(workspace);
        notificationService.info({
          title: "notification.events.update_workspace",
          translocoTitleParams: {
            username: content.updatedBy?.fullName,
            name: content.workspace.name,
          },
        });
      }
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
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  const projectRepositoryService = inject(ProjectRepositoryService);
  const projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  const projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  const router = inject(Router);

  const content = message.event.content as {
    workspaceId: string;
    projectId: string;
    userId?: string;
    selfRecipient: boolean;
  };
  const currentWorkspace = workspaceRepositoryService.entityDetail();
  switch (message.event.type) {
    // @ts-expect-error FALLS THROUGH
    case ProjectInvitationEventType.AcceptProjectInvitation: {
      if (
        content.userId &&
        currentWorkspace &&
        content.workspaceId === currentWorkspace.id &&
        router.url.startsWith(getWorkspaceMembersRootUrl(currentWorkspace))
      ) {
        workspaceMembershipRepositoryService.addToProjectCount({
          userId: content.userId,
          workspaceId: content.workspaceId,
        });
        return;
      }
    }
    // eslint-disable-next-line no-fallthrough
    case ProjectInvitationEventType.CreateProjectInvitation:
    case ProjectInvitationEventType.RevokeProjectInvitation:
    // @ts-expect-error FALLS THROUGH
    case ProjectInvitationEventType.DenyProjectInvitation: {
      if (content.selfRecipient) {
        // invitation is for this specific user
        if (router.url === HOMEPAGE_URL) {
          await workspaceRepositoryService.listRequest();
          return;
        }
        if (
          currentWorkspace &&
          content.workspaceId === currentWorkspace.id &&
          router.url === getWorkspaceProjectsUrl(currentWorkspace)
        ) {
          projectRepositoryService.listRequest({ workspaceId: currentWorkspace.id }).then();
        }
        break;
      }
    }
    // eslint-disable-next-line no-fallthrough
    case ProjectInvitationEventType.UpdateProjectInvitation:
    case ProjectInvitationEventType.DeleteProjectInvitation: {
      // update and delete are transparent for invitation recipient
      if (!content.selfRecipient) {
        // invitation is for other members
        const currentProject = projectRepositoryService.entityDetail();
        if (
          currentProject &&
          content.projectId === currentProject.id &&
          router.url.startsWith(getProjectMembersRootUrl(currentProject))
        ) {
          {
            projectInvitationRepositoryService.listProjectInvitations(currentProject.id).then();
            if (message.event.type === ProjectInvitationEventType.AcceptProjectInvitation) {
              projectMembershipRepositoryService.listProjectMembershipRequest(currentProject.id).then();
            }
          }
        }
        break;
      }
    }
  }
}

export async function applyWorkspaceInvitationEventType(message: WSResponseEvent<unknown>) {
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  const workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  const router = inject(Router);

  const content = message.event.content as { workspaceId: string; selfRecipient: boolean };
  switch (message.event.type) {
    case WorkspaceInvitationEventType.CreateWorkspaceInvitation:
    case WorkspaceInvitationEventType.AcceptWorkspaceInvitation:
    case WorkspaceInvitationEventType.RevokeWorkspaceInvitation:
    // @ts-expect-error FALLS THROUGH
    case WorkspaceInvitationEventType.DenyWorkspaceInvitation: {
      if (content.selfRecipient) {
        // invitation is for this specific user
        if (router.url === HOMEPAGE_URL) {
          await workspaceRepositoryService.listRequest();
          return;
        }
        break;
      }
    }
    // eslint-disable-next-line no-fallthrough
    case WorkspaceInvitationEventType.UpdateWorkspaceInvitation:
    case WorkspaceInvitationEventType.DeleteWorkspaceInvitation: {
      // update and delete are transparent for invitation recipient
      if (!content.selfRecipient) {
        // invitation is for other members
        const currentWorkspace = workspaceRepositoryService.entityDetail();
        if (
          currentWorkspace &&
          content.workspaceId === currentWorkspace.id &&
          router.url.startsWith(getWorkspaceMembersRootUrl(currentWorkspace))
        ) {
          workspaceInvitationRepositoryService.listWorkspaceInvitations(currentWorkspace.id).then();
          if (message.event.type === WorkspaceInvitationEventType.AcceptWorkspaceInvitation) {
            workspaceMembershipRepositoryService.listWorkspaceMembershipRequest(currentWorkspace.id).then();
          }
        }
      }
      break;
    }
  }
}
