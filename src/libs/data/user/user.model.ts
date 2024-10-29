import { Tokens } from "@tenzu/data/auth";
import { ProjectInvitationInfo, Workspace, WorkspaceInvitationInfo, WorkspaceProject } from "@tenzu/data/workspace";

import { ProjectBase } from "@tenzu/data/project";

export interface User {
  username: string;
  fullName: string;
  color: number;
  email: string;
  lang: string;
}

export type UserMinimal = Pick<User, "username" | "fullName" | "color">;

export type UserCreation = Omit<User, "username" | "color" | "lang"> & {
  password: string;
  username?: string;
  acceptTerms: boolean;
  color?: number;
  lang?: string;
  projectInvitationToken?: string;
  workspaceInvitationToken?: string;
  acceptProjectInvitation?: boolean;
  acceptWorkspaceInvitation?: boolean;
};

export type UserEdition = {
  fullName: string;
  lang: string;
  password: string;
};

export interface UserFilter {
  project?: number;
}

export type WorkspaceForDelete = Pick<Workspace, "id" | "name" | "slug" | "color"> & {
  projects: WorkspaceProject[];
};

export type ProjectForDelete = ProjectBase & {
  id: string;
  logoSmall?: string;
  logoLarge?: string;
  workspace: Pick<Workspace, "id" | "name" | "slug">;
};

export type UserDeleteInfo = {
  workspaces: WorkspaceForDelete[];
  projects: ProjectForDelete[];
};

export type VerificationData = {
  auth: Tokens;
  workspaceInvitation: WorkspaceInvitationInfo;
  projectInvitationToken: ProjectInvitationInfo;
};
