import { Project } from "../project/project.model";

export type WorkspaceProject = Pick<Project, "id" | "name" | "slug" | "description" | "color" | "logoSmall">;

export type WorkspaceRole = "admin" | "member" | "guest" | "none";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  color: number;
  latestProjects: WorkspaceProject[];
  invitedProjects: WorkspaceProject[];
  totalProjects: number;
  hasProjects: boolean;
  userRole: WorkspaceRole;
}

// not implemented yet
export type WorkspaceFilter = Record<string, never>;

export interface WorkspaceCreation {
  name: string;
  color: number;
}

export interface WorkspaceEdition {
  name: string;
}

export interface WorkspaceDetail {
  workspace: Workspace;
  workspaceProject: Project[];
}

export interface InvitationInfo {
  status: "pending" | "accepted" | "revoked";
  email: string;
  existingUser: boolean;
  availableLogins: string[];
}

export interface ProjectInvitationInfo extends InvitationInfo {
  project: {
    id: string;
    name: string;
    slug: string;
    anonUserCanView: boolean;
  };
}

export interface WorkspaceInvitationInfo extends InvitationInfo {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
}
