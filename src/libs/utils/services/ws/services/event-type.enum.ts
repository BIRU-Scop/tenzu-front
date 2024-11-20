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
export enum FamilyEventType {
  Story = "stories",
  Workflow = "workflows",
  WorkflowStatuses = "workflowstatuses",
  StoryAssignment = "storiesassignments",
  StoryAttachment = "storiesattachments",
}
