/*
 * Copyright (C) 2025 BIRU
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

export enum WorkflowStatusEventType {
  CreateWorkflowStatus = "workflowstatuses.create",
  UpdateWorkflowStatus = "workflowstatuses.update",
  ReorderWorkflowStatus = "workflowstatuses.reorder",
  DeleteWorkflowStatus = "workflowstatuses.delete",
}

export enum WorkflowEventType {
  CreateWorkflow = "workflows.create",
  UpdateWorkflow = "workflows.update",
  DeleteWorkflow = "workflows.delete",
}

export enum StoryEventType {
  CreateStory = "stories.create",
  UpdateStory = "stories.update",
  ReorderStory = "stories.reorder",
  DeleteStory = "stories.delete",
}
export enum StoryAssignmentEventType {
  CreateStoryAssignment = "storiesassignments.create",
  DeleteStoryAssignment = "storiesassignments.delete",
}

export enum StoryAttachmentEventType {
  CreateStoryAttachment = "storiesattachments.create",
  DeleteStoryAttachment = "storiesattachments.delete",
}
export enum ProjectInvitationEventType {
  CreateProjectInvitation = "projectinvitations.create",
  AcceptProjectInvitation = "projectmemberships.create",
  RevokeProjectInvitation = "projectinvitations.revoke",
  DenyProjectInvitation = "projectinvitations.deny",
}
export enum ProjectMembershipEventType {
  CreateProjectMembership = "projectmemberships.create",
  UpdateProjectMembership = "projectmemberships.update",
  DeleteProjectMembership = "projectmemberships.delete",
}
export enum ProjectEventType {
  DeleteProject = "projects.delete",
  UpdateProject = "projects.update",
}
export enum WorkspaceInvitationEventType {
  CreateWorkspaceInvitation = "workspaceinvitations.create",
  UpdateWorkspaceInvitation = "workspaceinvitations.update",
  AcceptWorkspaceInvitation = "workspacememberships.create",
  DeleteWorkspaceInvitation = "workspaceinvitations.delete",
}
export enum WorkspaceMembershipEventType {
  UpdateWorkspaceMembership = "workspacememberships.update",
}
export enum WorkspaceEventType {
  WorkspaceDelete = "workspaces.delete",
}

export enum UserEventType {
  DeleteUser = "users.delete",
}
export enum NotificationEventType {
  CreateNotification = "notifications.create",
  ReadNotifications = "notifications.read",
}

export enum FamilyEventType {
  Story = "stories",
  Workflow = "workflows",
  WorkflowStatuses = "workflowstatuses",
  StoryAssignment = "storiesassignments",
  StoryAttachment = "storiesattachments",
  ProjectInvitation = "projectinvitations",
  ProjectMembership = "projectmemberships",
  WorkspaceInvitation = "workspaceinvitations",
  WorkspaceMembership = "workspacememberships",
  Project = "projects",
  Workspace = "workspaces",
  User = "users",
  Notification = "notifications",
}
