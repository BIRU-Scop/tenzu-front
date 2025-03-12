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

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BreadcrumbStore } from "@tenzu/repository/breadcrumb/breadcrumb.store";
import { toObservable } from "@angular/core/rxjs-interop";
import { SideNavStore } from "@tenzu/repository/sidenav";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";

@Component({
  selector: "app-workspace-detail",
  imports: [RouterOutlet],
  template: ` <router-outlet />`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDetailComponent {
  workspaceService = inject(WorkspaceRepositoryService);
  sideNavStore = inject(SideNavStore);
  breadcrumbStore = inject(BreadcrumbStore);

  constructor() {
    toObservable(this.workspaceService.entityDetail)
      .pipe(filterNotNull())
      .subscribe((workspace) => {
        this.sideNavStore.setAvatar(
          workspace
            ? { name: workspace.name, type: "workspace.general_title.workspace", color: workspace.color }
            : undefined,
        );
      });
    this.sideNavStore.setPrimaryNavItems([
      {
        label: "workspace.general_title.workspaceListProjects",
        iconName: "lists",
        href: "projects",
        testId: "projects-link",
      },
    ]);
    this.sideNavStore.setSecondaryNavItems([
      {
        label: "workspace.general_title.workspacePeople",
        iconName: "group",
        href: "people",
        testId: "people-link",
      },
      {
        label: "workspace.general_title.workspaceSettings",
        iconName: "settings",
        href: "settings",
        testId: "settings-link",
      },
    ]);
    this.breadcrumbStore.setFourthLevel(undefined);

    this.breadcrumbStore.setFirstLevel({
      label: "workspace.general_title.workspaces",
      link: "/",
      doTranslation: true,
    });
    toObservable(this.workspaceService.entityDetail)
      .pipe(filterNotNull())
      .subscribe((workspace) => {
        this.breadcrumbStore.setSecondLevel({
          label: workspace.name,
          link: `workspace/${workspace.id}`,
          doTranslation: false,
        });
        this.breadcrumbStore.setFourthLevel(undefined);
      });
  }
}
