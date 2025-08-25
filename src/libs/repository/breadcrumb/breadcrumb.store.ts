/*
 * Copyright (C) 2024-2025 BIRU
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

import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { computed, inject } from "@angular/core";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { StoryRepositoryService } from "@tenzu/repository/story";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { WorkflowRepositoryService } from "@tenzu/repository/workflow";

type BreadCrumbNodeConfig = {
  label: string;
  link?: string;
  doTranslation: boolean;
};

type KeyBreadcrumbNodeConfig =
  | "workspaces" // root
  | "workspaceDetail" // name for the workspace
  | "workspaceDetailProjectList"
  | "workspaceDetailSettings"
  | "workspaceDetailMember"
  | "projectDetail"
  | "projectSettings"
  | "projectMembers"
  | "projectCreateWorkflow"
  | "projectKanban"
  | "projectWorkflow"
  | "storyDetail";

type KeyPathBreadcrumbComponent =
  | "workspaceProjectList"
  | "workspaceSettings"
  | "workspaceMembers"
  | "projectMembers"
  | "projectSettings"
  | "projectKanban"
  | "projectCreateWorkflow"
  | "storyDetail";
const pathBreadcrumbComponent: Record<KeyPathBreadcrumbComponent, KeyBreadcrumbNodeConfig[]> = {
  workspaceProjectList: ["workspaces", "workspaceDetail", "workspaceDetailProjectList"],
  workspaceSettings: ["workspaces", "workspaceDetail", "workspaceDetailSettings"],
  workspaceMembers: ["workspaces", "workspaceDetail", "workspaceDetailMember"],
  projectMembers: ["workspaces", "workspaceDetail", "workspaceDetailProjectList", "projectDetail", "projectMembers"],
  projectSettings: ["workspaces", "workspaceDetail", "workspaceDetailProjectList", "projectDetail", "projectSettings"],
  projectKanban: [
    "workspaces",
    "workspaceDetail",
    "workspaceDetailProjectList",
    "projectDetail",
    "projectKanban",
    "projectWorkflow",
  ],
  projectCreateWorkflow: [
    "workspaces",
    "workspaceDetail",
    "workspaceDetailProjectList",
    "projectDetail",
    "projectKanban",
    "projectCreateWorkflow",
  ],
  storyDetail: ["workspaces", "workspaceDetail", "workspaceDetailProjectList", "projectDetail", "storyDetail"],
};

export const BreadcrumbStore = signalStore(
  { providedIn: "root" },
  withState<{ keyPathComponent: KeyPathBreadcrumbComponent | undefined }>({ keyPathComponent: undefined }),
  withProps(() => ({
    workspaceDetail: inject(WorkspaceRepositoryService).entityDetail,
    storyDetail: inject(StoryRepositoryService).entityDetail,
    projectDetail: inject(ProjectRepositoryService).entityDetail,
    workflowDetail: inject(WorkflowRepositoryService).entityDetail,
  })),
  withMethods((store) => ({
    setPathComponent(keyPathComponent: KeyPathBreadcrumbComponent) {
      patchState(store, { keyPathComponent });
    },
    reset() {
      patchState(store, { keyPathComponent: undefined });
    },
  })),
  withComputed((store) => ({
    breadcrumb: computed(() => {
      const workspaceDetail = store.workspaceDetail();
      const projectDetail = store.projectDetail();
      const workflowDetail = store.workflowDetail();

      const breadcrumbNodeConfig: Record<KeyBreadcrumbNodeConfig, BreadCrumbNodeConfig> = {
        workspaces: {
          label: "workspace.general_title.workspaces",
          link: "/",
          doTranslation: true,
        },
        workspaceDetail: {
          label: workspaceDetail?.name || "",
          link: `/workspace/${workspaceDetail?.id}`,
          doTranslation: false,
        },
        workspaceDetailProjectList: {
          label: "workspace.general_title.workspace_list_projects",
          link: `/workspace/${workspaceDetail?.id}/projects`,
          doTranslation: true,
        },
        workspaceDetailSettings: {
          label: "workspace.general_title.workspace_settings",
          link: `/workspace/${workspaceDetail?.id}/settings`,
          doTranslation: true,
        },
        workspaceDetailMember: {
          label: "workspace.general_title.workspace_members",
          link: `/workspace/${workspaceDetail?.id}/members`,
          doTranslation: true,
        },
        projectDetail: {
          label: projectDetail?.name || "",
          link: `/workspace/${workspaceDetail?.id}/project/${projectDetail?.id}/${projectDetail?.landingPage}`,
          doTranslation: false,
        },
        projectSettings: {
          label: "workspace.general_title.project_settings",
          link: `/workspace/${workspaceDetail?.id}/project/${projectDetail?.id}/settings`,
          doTranslation: true,
        },
        projectMembers: {
          label: "workspace.general_title.project_members",
          link: `/workspace/${workspaceDetail?.id}/project/${projectDetail?.id}/members`,
          doTranslation: true,
        },
        projectCreateWorkflow: {
          label: "workflow.create_workflow.dialog.create_workflow",
          link: `/workspace/${workspaceDetail?.id}/project/${projectDetail?.id}/new-workflow`,
          doTranslation: true,
        },
        projectKanban: {
          label: "workspace.general_title.kanban",
          link: `/workspace/${workspaceDetail?.id}/project/${projectDetail?.id}`,
          doTranslation: true,
        },
        projectWorkflow: {
          label: workflowDetail?.name || "",
          link: `/workspace/${workspaceDetail?.id}/project/${projectDetail?.id}/workflow/${workflowDetail?.slug}`,
          doTranslation: false,
        },
        storyDetail: {
          label: "workflow.detail_story.story",
          doTranslation: true,
        },
      };

      const keyPathComponent = store.keyPathComponent();
      if (!keyPathComponent) {
        return [];
      }
      return pathBreadcrumbComponent[keyPathComponent].map(
        (component) => breadcrumbNodeConfig[component] as BreadCrumbNodeConfig,
      );
    }),
  })),
);
