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
