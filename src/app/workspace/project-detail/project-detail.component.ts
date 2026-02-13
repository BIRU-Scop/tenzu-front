/*
 * Copyright (C) 2024-2026 BIRU
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

import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { SideNavStore } from "@tenzu/repository/sidenav";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace/workspace-repository.service";
import { MemberPermission } from "@tenzu/repository/membership";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { handleHttpError } from "@tenzu/utils/functions/http-error-handler";

@Component({
  selector: "app-project-detail",
  imports: [RouterOutlet, PermissionOrRedirectDirective],
  template: ` @let project = projectRepositoryService.entityDetail();
    @if (project) {
      <ng-container
        [appPermissionOrRedirect]="{
          expectedId: project.id,
          requiredPermission: MemberPermission,
          type: 'project',
        }"
      >
        <router-outlet />
      </ng-container>
    }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  projectId = input.required<string>();
  protected readonly MemberPermission = MemberPermission;
  router = inject(Router);
  sideNavStore = inject(SideNavStore);
  workspaceService = inject(WorkspaceRepositoryService);
  projectRepositoryService = inject(ProjectRepositoryService);
  baseUrl = computed(
    () =>
      `/workspace/${this.workspaceService.entityDetail()?.id}/project/${this.projectRepositoryService.entityDetail()?.id}`,
  );

  constructor() {
    effect(() => {
      const projectId = this.projectId();
      const promise = this.projectRepositoryService.setup({ projectId });
      promise?.catch((error) => {
        handleHttpError(error, this.router, { context: "Project", message: "Could not load project." });
      });
    });
    toObservable(this.projectRepositoryService.entityDetail)
      .pipe(filterNotNull())
      .subscribe((project) => {
        this.sideNavStore.setAvatar(
          project ? { name: project.name, type: "workspace.general_title.project", color: project.color } : undefined,
        );
      });

    toObservable(this.baseUrl).subscribe((baseUrl) => {
      this.sideNavStore.setPrimaryNavItems([
        {
          label: "workspace.general_title.kanban",
          iconName: "view_column",
          href: `${baseUrl}/kanban`,
          testId: "kanban-link",
          componentConfig: {
            componentRef: "SidenavListWorkflowComponent",
          },
        },
      ]);
      this.sideNavStore.setSecondaryNavItems([
        {
          label: "workspace.general_title.project_members",
          iconName: "group",
          href: `${baseUrl}/members`,
          testId: "members-link",
        },
        {
          label: "workspace.general_title.project_settings",
          iconName: "settings",
          href: `${baseUrl}/settings`,
          testId: "settings-link",
        },
      ]);
    });
  }
}
