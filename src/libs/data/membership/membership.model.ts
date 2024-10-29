import { User, UserMinimal } from "@tenzu/data/user";
import { Project } from "@tenzu/data/project";
import { Workspace } from "@tenzu/data/workspace";

export type ProjectForProjectMembership = Pick<
  Project,
  "logo" | "logoSmall" | "logoLarge" | "id" | "name" | "slug" | "description" | "color"
>;

export type WorkspaceForWorkspaceMembership = Pick<Workspace, "id" | "name" | "slug">;

export type ProjectMembership = {
  user: UserMinimal;
  role: {
    name: string;
    slug: string;
    isAdmin: true;
    permissions: [string];
  };
  project: ProjectForProjectMembership;
};

export type WorkspaceMembership = {
  user: UserMinimal;
  workspace: WorkspaceForWorkspaceMembership;
  projects: ProjectForProjectMembership[];
};

export interface Invitation {
  id: string;
  user?: User;
  email?: string;
}

export interface InvitationsResponse {
  already_members: number;
  invitations: Invitation[];
}

export type WorkspaceGuest = Omit<WorkspaceMembership, "role">;
