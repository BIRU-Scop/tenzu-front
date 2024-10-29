import { Workspace } from "../workspace";
import { Workflow } from "../workflow";

export interface ProjectBase {
  name: string;
  description?: string;
  color: number;
  logo?: File;
}

export type ProjectCreation = ProjectBase & {
  workspaceId: string;
};

export type ProjectSummary = ProjectBase & {
  id: string;
  workspaceId: string;
  slug: string;
};

export type Project = ProjectSummary & {
  logoSmall?: string;
  logoLarge?: string;
  workspace: Pick<Workspace, "id" | "name" | "slug" | "color" | "userRole">;
  workflows: Workflow[];
  userIsAdmin: boolean;
  userIsMember: boolean;
  userPermissions: string[];
  userHasPendingInvitation: boolean;
  anonUserCanView?: boolean;
};

export type ProjectFilter = Record<string, never>;

export interface ProjectInvitationAccept {
  id: string;
  workspaceId: string;
  email: string;
  project: {
    id: string;
    name: string;
    slug: string;
    anonUserCanView: boolean;
  };
  user: {
    username: string;
  };
}
