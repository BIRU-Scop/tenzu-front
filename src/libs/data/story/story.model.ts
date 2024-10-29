import { Status } from "@tenzu/data/status";
import { User, UserMinimal } from "@tenzu/data/user";
import { Workflow } from "@tenzu/data/workflow";
export type StoryReorderPayload = {
  reorder?: {
    place: "after" | "before";
    ref: number;
  };
  status: string;
  stories: number[];
};

export type Story = {
  ref: number;
  title: string;
  version: number;
  description: string;
  workflowId: string;
  status: Status;
  assignees: Array<UserMinimal>;
};

export interface createdBy {
  username: string;
  fullName: string;
  color: number;
}

export interface StoryDetail extends Story {
  workflow: Pick<Workflow, "id" | "name" | "slug">;
  prev: null | {
    ref: Story["ref"];
    title: Story["title"];
  };
  next: null | {
    ref: Story["ref"];
    title: Story["title"];
  };
  createdBy?: Pick<User, "username" | "fullName" | "color">;
  createdAt: string;
  titleUpdatedAt: string | null;
  titleUpdatedBy: Pick<User, "username" | "fullName" | "color"> | null;
  descriptionUpdatedAt: string | null;
  descriptionUpdatedBy: Pick<User, "username" | "fullName" | "color"> | null;
}

export type StoryCreate = {
  title: string;
  status: string;
};

export type StoryAttachment = {
  id: string;
  name: string;
  contentType: string;
  createdAt: string;
  size: number;
  file: string;
};

export type StoryAssign = {
  user: UserMinimal;
  story: Pick<Story, "ref" | "title">;
};
