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

export enum PermissionsBase {
  CREATE_MODIFY_MEMBER = "create_modify_member",
  DELETE_MEMBER = "delete_member",
}

export enum WorkspacePermissions {
  CREATE_MODIFY_MEMBER = "create_modify_member",
  DELETE_MEMBER = "delete_member",
  MODIFY_WORKSPACE = "modify_workspace",
  DELETE_WORKSPACE = "delete_workspace",
  CREATE_PROJECT = "create_project",
}

export enum ProjectPermissions {
  CREATE_MODIFY_MEMBER = "create_modify_member",
  DELETE_MEMBER = "delete_member",
  CREATE_MODIFY_DELETE_ROLE = "create_modify_delete_role",
  MODIFY_PROJECT = "modify_project",
  DELETE_PROJECT = "delete_project",
  VIEW_STORY = "view_story",
  MODIFY_STORY = "modify_story",
  CREATE_STORY = "create_story",
  DELETE_STORY = "delete_story",
  VIEW_COMMENT = "view_comment",
  CREATE_MODIFY_DELETE_COMMENT = "create_modify_delete_comment",
  MODERATE_COMMENT = "moderate_comment",
  VIEW_WORKFLOW = "view_workflow",
  MODIFY_WORKFLOW = "modify_workflow",
  CREATE_WORKFLOW = "create_workflow",
  DELETE_WORKFLOW = "delete_workflow",
}

export type GroupPermissionKey = "role" | "project" | "member" | "story" | "workflow" | "comment";
export type GroupPermissions = {
  labelTransloco: string;
  permissions: ProjectPermissions[];
};

export const AllProjectPermissionsByTheme: Record<GroupPermissionKey, GroupPermissions> = {
  role: {
    labelTransloco: "project.settings.permissions.role.label",
    permissions: [ProjectPermissions.CREATE_MODIFY_DELETE_ROLE],
  },
  project: {
    labelTransloco: "project.settings.permissions.project.label",
    permissions: [ProjectPermissions.MODIFY_PROJECT, ProjectPermissions.DELETE_PROJECT],
  },

  member: {
    labelTransloco: "project.settings.permissions.member.label",
    permissions: [ProjectPermissions.CREATE_MODIFY_MEMBER, ProjectPermissions.DELETE_MEMBER],
  },

  story: {
    labelTransloco: "project.settings.permissions.story.label",
    permissions: [
      ProjectPermissions.VIEW_STORY,
      ProjectPermissions.MODIFY_STORY,
      ProjectPermissions.CREATE_STORY,
      ProjectPermissions.DELETE_STORY,
    ],
  },

  workflow: {
    labelTransloco: "project.settings.permissions.workflow.label",
    permissions: [
      ProjectPermissions.VIEW_WORKFLOW,
      ProjectPermissions.MODIFY_WORKFLOW,
      ProjectPermissions.CREATE_WORKFLOW,
      ProjectPermissions.DELETE_WORKFLOW,
    ],
  },
  comment: {
    labelTransloco: "project.settings.permissions.comment.label",
    permissions: [
      ProjectPermissions.VIEW_COMMENT,
      ProjectPermissions.CREATE_MODIFY_DELETE_COMMENT,
      ProjectPermissions.MODERATE_COMMENT,
    ],
  },
};
