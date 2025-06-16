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
  ProjectMembershipEventType,
  ProjectRoleEventType,
  StoryAssignmentEventType,
  StoryAttachmentEventType,
  StoryEventType,
  UserEventType,
  WorkflowEventType,
  WorkflowStatusEventType,
  WorkspaceEventType,
  WorkspaceInvitationEventType,
  WorkspaceMembershipEventType,
} from "./event-type.enum";
import { Location } from "@angular/common";
import { ProjectDetail, ProjectRepositoryService, ProjectSummary } from "@tenzu/repository/project";
import { ReorderWorkflowStatusesPayload, Workflow, WorkflowNested } from "@tenzu/repository/workflow";
import { ActivatedRoute, Router } from "@angular/router";
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
  getProjectRoleDetailEndingUrl,
  getStoryDetailUrl,
  getWorkflowRootUrl,
  getWorkflowUrl,
  getWorkspaceMembersRootUrl,
  HOMEPAGE_URL,
} from "@tenzu/utils/functions/urls";
import { StoryAttachment, StoryAttachmentRepositoryService } from "@tenzu/repository/story-attachment";
import { WorkspaceDetail, WorkspaceSummary } from "@tenzu/repository/workspace";
import { ProjectInvitationRepositoryService } from "@tenzu/repository/project-invitations";
import { WorkspaceInvitationRepositoryService } from "@tenzu/repository/workspace-invitations";
import {
  WorkspaceMembership,
  WorkspaceMembershipNested,
  WorkspaceMembershipRepositoryService,
} from "@tenzu/repository/workspace-membership";
import { ProjectMembership, ProjectMembershipRepositoryService } from "@tenzu/repository/project-membership";
import { Role } from "@tenzu/repository/membership";
import { WorkspacePermissions } from "@tenzu/repository/permission/permission.model";
import { NotFoundEntityError } from "@tenzu/repository/base/errors";
import { ProjectRoleDetail, ProjectRoleRepositoryService } from "@tenzu/repository/project-roles";

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
      if (content.updatesAttrs.includes("workflow")) {
        const workspace = workspaceService.entityDetail();
        if (workspace) {
          const storyDetailUrl = getStoryDetailUrl({ workspaceId: workspace.id, id: story.projectId }, story.ref);
          if (router.url === storyDetailUrl) {
            await workflowService.getRequest({ workflowId: story.workflow.id });
          }
          if (
            router.url === storyDetailUrl ||
            router.url.startsWith(getWorkflowRootUrl({ workspaceId: workspace.id, id: story.projectId }))
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
      if (
        workspace &&
        project &&
        router.url === getStoryDetailUrl({ workspaceId: workspace.id, id: project.id }, content.ref)
      ) {
        const workflowUrl = workflow
          ? getWorkflowUrl({ workspaceId: workspace.id, id: project.id }, workflow.slug)
          : getWorkflowRootUrl({ workspaceId: workspace.id, id: project.id });
        await router.navigateByUrl(workflowUrl);
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
  const projectRepositoryService = inject(ProjectRepositoryService);
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case ProjectEventType.DeleteProject: {
      const content = message.event.content as {
        deletedBy: UserNested;
        projectId: string;
        workspaceId: string;
        name: string;
      };
      const currentProject = projectRepositoryService.entityDetail();
      const currentWorkspace = workspaceRepositoryService.entityDetail();
      projectRepositoryService.deleteEntitySummary(content.projectId);
      if (currentProject && currentProject.id === content.projectId) {
        await router.navigateByUrl("/");
        projectRepositoryService.deleteEntityDetail(currentProject);
      }
      if (currentWorkspace && content.workspaceId === currentWorkspace.id) {
        workspaceRepositoryService.updateEntityDetail({
          ...currentWorkspace,
          totalProjects: currentWorkspace.totalProjects - 1,
        });
        if (router.url.startsWith(getWorkspaceMembersRootUrl(currentWorkspace))) {
          // reload totalProjectsIsMembers
          workspaceMembershipRepositoryService.listWorkspaceMembershipRequest(currentWorkspace.id).then();
        }
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

      const currentProject = projectRepositoryService.entityDetail();

      const projectIsAlreadyUpdated = JSON.stringify(currentProject) == JSON.stringify(project);

      if (!projectIsAlreadyUpdated) {
        projectRepositoryService.updateEntityDetail(project);
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
    case ProjectEventType.CreateProject: {
      const content = message.event.content as {
        project?: ProjectSummary;
        createdById: UserNested["id"];
        workspaceId: WorkspaceSummary["id"];
      };
      if (content.project) {
        if (router.url === HOMEPAGE_URL) {
          await workspaceRepositoryService.listRequest();
          break;
        }
      }
      const currentWorkspace = workspaceRepositoryService.entityDetail();
      if (currentWorkspace && currentWorkspace.id === content.workspaceId) {
        if (content.project) {
          projectRepositoryService.addEntitySummary(content.project);
        } else {
          workspaceRepositoryService.updateEntityDetail({
            ...currentWorkspace,
            totalProjects: currentWorkspace.totalProjects + 1,
          });
          workspaceMembershipRepositoryService.addToProjectCount({
            userId: content.createdById,
            workspaceId: content.workspaceId,
          });
        }
      }
    }
  }
}

export async function applyWorkspaceEvent(message: WSResponseEvent<unknown>) {
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  switch (message.event.type) {
    case WorkspaceEventType.CreateWorkspace: {
      const content = message.event.content as { workspace: WorkspaceDetail };
      workspaceRepositoryService.prependEntitySummary(content.workspace);
      break;
    }
    case WorkspaceEventType.DeleteWorkspace: {
      const content = message.event.content as { deletedBy: UserNested; workspaceId: string; name: string };
      const currentWorkspace = workspaceRepositoryService.entityDetail();
      workspaceRepositoryService.deleteEntitySummary(content.workspaceId);
      if (currentWorkspace && currentWorkspace.id === content.workspaceId) {
        await router.navigateByUrl("/");
        workspaceRepositoryService.deleteEntityDetail(currentWorkspace);
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

      const currentProject = workspaceRepositoryService.entityDetail();

      const workspaceIsAlreadyUpdated = JSON.stringify(currentProject) == JSON.stringify(workspace);

      if (!workspaceIsAlreadyUpdated) {
        workspaceRepositoryService.updateEntityDetail(workspace);
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
      authService.logout();
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
  const projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

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
      const content = message.event.content as {
        workspaceId: string;
        projectId: string;
        userId?: string;
        selfRecipient: boolean;
        membership: ProjectMembership;
        workspaceMembership?: WorkspaceMembership;
      };
      if (content.userId && currentWorkspace && content.workspaceId === currentWorkspace.id) {
        if (content.workspaceMembership) {
          // handle default workspace membership created as a consequence of accepting project invitation
          workspaceMembershipRepositoryService.addEntitySummary(content.workspaceMembership);
        } else {
          workspaceMembershipRepositoryService.addToProjectCount({
            userId: content.userId,
            workspaceId: content.workspaceId,
          });
        }
        if (!content.selfRecipient) {
          const currentProject = projectRepositoryService.entityDetail();
          if (currentProject && content.projectId === currentProject.id) {
            projectMembershipRepositoryService.addEntitySummary(content.membership);
            projectRoleRepositoryService.updateMembersCount(undefined, content.membership.roleId);
          }
        }
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
          break;
        }
        if (currentWorkspace && content.workspaceId === currentWorkspace.id) {
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
        if (currentProject && content.projectId === currentProject.id) {
          if (router.url.startsWith(getProjectMembersRootUrl(currentProject))) {
            projectInvitationRepositoryService.listProjectInvitations(currentProject.id).then();
          }
        }
      }
      break;
    }
  }
  if (message.event.type === ProjectInvitationEventType.RevokeProjectInvitation && content.selfRecipient) {
    notificationService.warning({
      title: "notification.events.revoked_project_invitation",
      translocoTitleParams: {
        id: content.projectId,
      },
    });
  }
}

export async function applyWorkspaceInvitationEventType(message: WSResponseEvent<unknown>) {
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const workspaceInvitationRepositoryService = inject(WorkspaceInvitationRepositoryService);
  const workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

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
          break;
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
        if (currentWorkspace && content.workspaceId === currentWorkspace.id) {
          if (router.url.startsWith(getWorkspaceMembersRootUrl(currentWorkspace))) {
            workspaceInvitationRepositoryService.listWorkspaceInvitations(currentWorkspace.id).then();
          }
          if (message.event.type === WorkspaceInvitationEventType.AcceptWorkspaceInvitation) {
            const content = message.event.content as {
              workspaceId: string;
              selfRecipient: boolean;
              membership: WorkspaceMembership;
            };
            workspaceMembershipRepositoryService.addEntitySummary(content.membership);
          }
        }
      }
      break;
    }
  }
  if (message.event.type === WorkspaceInvitationEventType.RevokeWorkspaceInvitation && content.selfRecipient) {
    notificationService.warning({
      title: "notification.events.revoked_workspace_invitation",
      translocoTitleParams: {
        id: content.workspaceId,
      },
    });
  }
}

export async function applyWorkspaceMembershipEventType(message: WSResponseEvent<unknown>) {
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const workspaceMembershipRepositoryService = inject(WorkspaceMembershipRepositoryService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  switch (message.event.type) {
    case WorkspaceMembershipEventType.UpdateWorkspaceMembership: {
      const content = message.event.content as {
        membership: WorkspaceMembershipNested;
        role: Role;
        selfRecipient: boolean;
      };
      const canCreateProject = content.role.permissions.includes(WorkspacePermissions.CREATE_PROJECT);
      const currentWorkspace = workspaceRepositoryService.entityDetail();
      if (currentWorkspace && content.membership.workspaceId === currentWorkspace.id) {
        if (content.selfRecipient) {
          workspaceRepositoryService.updateEntityDetail({
            ...currentWorkspace,
            userCanCreateProjects: canCreateProject,
            userRole: content.role,
          });
          notificationService.warning({
            title: "notification.events.update_workspace_membership",
            translocoTitleParams: {
              name: currentWorkspace.name,
              role: content.role.name,
            },
          });
        } else {
          // event will be received twice so we only act on it once
          workspaceMembershipRepositoryService.updateEntitySummary(content.membership.id, content.membership);
        }
      } else if (content.selfRecipient) {
        try {
          workspaceRepositoryService.updateEntitySummary(content.membership.workspaceId, {
            userCanCreateProjects: canCreateProject,
          });
        } catch (e) {
          if (!(e instanceof NotFoundEntityError)) {
            throw e;
          }
        }
      }
      break;
    }
    case WorkspaceMembershipEventType.DeleteWorkspaceMembership: {
      const content = message.event.content as {
        membership: WorkspaceMembershipNested;
        selfRecipient: boolean;
      };
      if (router.url === HOMEPAGE_URL && content.selfRecipient) {
        await workspaceRepositoryService.listRequest();
        break;
      }
      const currentWorkspace = workspaceRepositoryService.entityDetail();
      if (currentWorkspace && content.membership.workspaceId === currentWorkspace.id) {
        if (content.selfRecipient) {
          await router.navigateByUrl("/");
          workspaceRepositoryService.deleteEntityDetail(currentWorkspace);
          notificationService.warning({
            title: "notification.events.delete_workspace_membership_self",
            translocoTitleParams: {
              name: currentWorkspace.name,
            },
          });
        } else {
          workspaceMembershipRepositoryService.deleteEntitySummary(content.membership.id);
        }
      }
      break;
    }
  }
}

export async function applyProjectMembershipEventType(message: WSResponseEvent<unknown>) {
  const workspaceRepositoryService = inject(WorkspaceRepositoryService);
  const projectRepositoryService = inject(ProjectRepositoryService);
  const projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  const projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  switch (message.event.type) {
    case ProjectMembershipEventType.UpdateProjectMembership: {
      const content = message.event.content as {
        membership: ProjectMembership;
        role: Role;
        project?: ProjectSummary;
        selfRecipient: boolean;
      };
      const currentProject = projectRepositoryService.entityDetail();
      if (currentProject && content.membership.projectId === currentProject.id) {
        if (content.selfRecipient) {
          projectRepositoryService.updateEntityDetail({ ...currentProject, userRole: content.role });
          notificationService.warning({
            title: "notification.events.update_project_membership",
            translocoTitleParams: {
              name: currentProject.name,
              role: content.role.name,
            },
          });
        } else {
          // event will be received twice so we only act on it once
          const previousRoleId = projectMembershipRepositoryService.entityMap()[content.membership.id]?.roleId;
          projectMembershipRepositoryService.updateEntitySummary(content.membership.id, content.membership);
          projectRoleRepositoryService.updateMembersCount(previousRoleId, content.membership.roleId);
        }
      } else if (content.project && content.selfRecipient) {
        const currentWorkspace = workspaceRepositoryService.entityDetail();
        if (currentWorkspace && content.project.workspaceId === currentWorkspace.id) {
          projectRepositoryService.addEntitySummary(content.project);
        }
      }
      break;
    }
    case ProjectMembershipEventType.DeleteProjectMembership: {
      const content = message.event.content as {
        membership: ProjectMembership;
        workspaceId: WorkspaceSummary["id"];
        selfRecipient: boolean;
      };

      const currentProject = projectRepositoryService.entityDetail();
      if (currentProject && content.membership.projectId === currentProject.id) {
        if (content.selfRecipient) {
          await router.navigateByUrl("/");
          projectRepositoryService.deleteEntityDetail(currentProject);
          notificationService.warning({
            title: "notification.events.delete_project_membership_self",
            translocoTitleParams: {
              name: currentProject.name,
            },
          });
        } else {
          // event will be received twice so we only act on it once
          projectMembershipRepositoryService.deleteEntitySummary(content.membership.id);
          projectRoleRepositoryService.updateMembersCount(content.membership.roleId);
        }
        break;
      }
      if (content.selfRecipient) {
        // invitation is for this specific user
        if (router.url === HOMEPAGE_URL) {
          await workspaceRepositoryService.listRequest();
          break;
        }
        const currentWorkspace = workspaceRepositoryService.entityDetail();
        if (currentWorkspace && content.workspaceId === currentWorkspace.id) {
          try {
            projectRepositoryService.deleteEntitySummary(content.membership.projectId);
          } catch (e) {
            if (!(e instanceof NotFoundEntityError)) {
              throw e;
            }
          }
        }
      }
      break;
    }
  }
}

export async function applyProjectRoleEventType(message: WSResponseEvent<unknown>) {
  const projectRepositoryService = inject(ProjectRepositoryService);
  const projectMembershipRepositoryService = inject(ProjectMembershipRepositoryService);
  const projectInvitationRepositoryService = inject(ProjectInvitationRepositoryService);
  const projectRoleRepositoryService = inject(ProjectRoleRepositoryService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);
  const activatedRoute = inject(ActivatedRoute);

  switch (message.event.type) {
    case ProjectRoleEventType.CreateProjectRole: {
      const content = message.event.content as {
        role: ProjectRoleDetail;
      };
      const currentProject = projectRepositoryService.entityDetail();
      if (currentProject && content.role.projectId === currentProject.id) {
        projectRoleRepositoryService.addEntitySummary(content.role);
      }
      break;
    }
    case ProjectRoleEventType.UpdateProjectRole: {
      const content = message.event.content as {
        role: ProjectRoleDetail;
      };
      const currentProject = projectRepositoryService.entityDetail();
      if (currentProject && content.role.projectId === currentProject.id) {
        const currentRole = projectRoleRepositoryService.entityDetail();
        if (currentRole && currentRole.id === content.role.id) {
          projectRoleRepositoryService.updateEntityDetail(content.role);
        } else {
          projectRoleRepositoryService.updateEntitySummary(content.role.id, content.role);
        }
        if (currentProject.userRole?.id === content.role.id) {
          projectRepositoryService.updateEntityDetail({ ...currentProject, userRole: content.role });
          notificationService.warning({
            title: "notification.events.update_project_role",
            translocoTitleParams: {
              name: currentProject.name,
              role: content.role.name,
            },
          });
        }
      }
      break;
    }
    case ProjectRoleEventType.DeleteProjectRole: {
      const content = message.event.content as {
        roleId: Role["id"];
        targetRole: Role;
        projectId: ProjectSummary["id"];
      };
      const currentProject = projectRepositoryService.entityDetail();
      if (currentProject && content.projectId === currentProject.id) {
        const currentRole = projectRoleRepositoryService.entityDetail();

        // update current user role if affected
        if (currentProject.userRole?.id === content.roleId) {
          projectRepositoryService.updateEntityDetail({ ...currentProject, userRole: content.targetRole });
          notificationService.warning({
            title: "notification.events.update_project_membership",
            translocoTitleParams: {
              name: currentProject.name,
              role: content.targetRole.name,
            },
          });
        }
        //update affected memberships and invitations
        const newMemberships = projectMembershipRepositoryService
          .entities()
          .filter((item) => item.roleId === content.roleId)
          .map((item) => ({ ...item, roleId: content.targetRole.id }));
        projectMembershipRepositoryService.upsertMultipleEntitiesSummary(newMemberships);
        const newInvitees = projectInvitationRepositoryService
          .entities()
          .filter((item) => item.roleId === content.roleId)
          .map((item) => ({ ...item, roleId: content.targetRole.id }));
        projectInvitationRepositoryService.upsertMultipleEntitiesSummary(newInvitees);

        // update meta info of target role
        if (currentRole && currentRole.id === content.targetRole.id) {
          projectRoleRepositoryService.updateEntityDetail({
            ...currentRole,
            totalMembers: currentRole.totalMembers + newMemberships.length,
            hasInvitees: currentRole.hasInvitees || newInvitees.length > 0,
          });
        } else {
          const targetRole = projectRoleRepositoryService.entityMapSummary()[content.targetRole.id];
          if (targetRole) {
            projectRoleRepositoryService.updateEntitySummary(content.targetRole.id, {
              totalMembers: targetRole.totalMembers + newMemberships.length,
              hasInvitees: targetRole.hasInvitees || newInvitees.length > 0,
            });
          }
        }

        //delete role
        if (currentRole && currentRole.id === content.roleId) {
          projectRoleRepositoryService.deleteEntityDetail(currentRole);
          if (router.url.endsWith(getProjectRoleDetailEndingUrl(currentRole))) {
            await router.navigate([".."], { relativeTo: activatedRoute });
          }
        } else {
          projectRoleRepositoryService.deleteEntitySummary(content.roleId);
        }
      }
      break;
    }
  }
}
