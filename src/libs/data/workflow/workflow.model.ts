import { Status } from "../status/status.model";

export enum Step {
  LEFT = -1,
  RIGHT = 1,
}

export type WorkflowReorderPayload = {
  statuses: string[];
  reorder: {
    place: "after" | "before";
    status: string;
  };
};

export type Workflow = {
  id: string;
  name: string;
  slug: string;
  projectId: string;
  statuses: Status[];
};
