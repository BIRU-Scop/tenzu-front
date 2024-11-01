/*
 * Copyright (C) 2024 BIRU
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

import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BreadcrumbComponent } from "@tenzu/shared/components/breadcrumb";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav";
import { BreadcrumbStore } from "@tenzu/data/breadcrumb";
import { WorkspaceStore } from "@tenzu/data/workspace";
import { toObservable } from "@angular/core/rxjs-interop";
import { ProjectStore } from "@tenzu/data/project";
import { SideNavStore } from "@tenzu/data/sidenav";
import { SidenavListWorkflowComponent } from "./sidenav-list-workflow/sidenav-list-workflow.component";

@Component({
  selector: "app-project-detail",
  standalone: true,
  imports: [RouterOutlet, BreadcrumbComponent, PrimarySideNavComponent],
  template: ` <router-outlet />`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  sideNavStore = inject(SideNavStore);
  workspaceStore = inject(WorkspaceStore);
  projectStore = inject(ProjectStore);
  breadcrumbStore = inject(BreadcrumbStore);
  baseUrl = computed(
    () => `/workspace/${this.workspaceStore.selectedEntity()?.id}/project/${this.projectStore.selectedEntity()?.id}`,
  );
  constructor() {
    toObservable(this.projectStore.selectedEntity).subscribe((project) => {
      this.sideNavStore.setAvatar(
        project ? { name: project.name, type: "workspace.general_title.project", color: project.color } : undefined,
      );
      if (project) {
        this.breadcrumbStore.setThirdLevel({
          label: "workspace.general_title.projects",
          link: "/",
          doTranslation: true,
        });
        this.breadcrumbStore.setFourthLevel({
          label: project.name,
          link: `project/${project.id}`,
          doTranslation: false,
        });
      }
    });
    this.breadcrumbStore.setFirstLevel({
      label: "workspace.general_title.workspaces",
      link: "/",
      doTranslation: true,
    });
    toObservable(this.baseUrl).subscribe((baseUrl) => {
      this.sideNavStore.setPrimaryNavItems([
        {
          label: "workspace.general_title.kanban",
          iconName: "view_column",
          href: `${baseUrl}/kanban`,
          testId: "kanban-link",
          componentConfig: {
            componentRef: SidenavListWorkflowComponent,
          },
        },
      ]);
      this.sideNavStore.setSecondaryNavItems([
        {
          label: "workspace.general_title.projectMembers",
          iconName: "group",
          href: `${baseUrl}/members`,
          testId: "members-link",
        },
        {
          label: "workspace.general_title.projectSettings",
          iconName: "settings",
          href: `${baseUrl}/settings`,
          testId: "settings-link",
        },
      ]);
    });

    toObservable(this.workspaceStore.selectedEntity).subscribe((workspace) => {
      if (workspace) {
        this.breadcrumbStore.setSecondLevel({
          label: workspace.name,
          link: `workspace/${workspace.id}`,
          doTranslation: false,
        });
      }
    });
  }
}
