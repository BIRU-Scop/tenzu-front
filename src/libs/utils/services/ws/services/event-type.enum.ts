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
  UpdateProjectInvitation = "projectinvitations.update",
  AcceptProjectInvitation = "projectmemberships.create",
  RevokeProjectInvitation = "projectinvitations.revoke",
  DeleteProjectInvitation = "projectinvitations.delete",
}
export enum ProjectMembershipEventType {
  CreateProjectMembership = "projectmemberships.create",
  UpdateProjectMembership = "projectmemberships.update",
  DeleteProjectMembership = "projectmemberships.delete",
}
export enum ProjectEventType {
  ProjectDelete = "projects.delete",
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
}
