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

import { ChangeDetectionStrategy, Component, effect, inject, input } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { toObservable } from "@angular/core/rxjs-interop";
import { SideNavStore } from "@tenzu/repository/sidenav";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { filterNotNull } from "@tenzu/utils/functions/rxjs.operators";
import { ProjectRepositoryService } from "@tenzu/repository/project";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { MemberPermission } from "@tenzu/repository/membership";

@Component({
  selector: "app-workspace-detail",
  imports: [RouterOutlet, PermissionOrRedirectDirective],
  template: ` @let workspace = workspaceRepositoryService.entityDetail();
    @if (workspace) {
      <ng-container
        [appPermissionOrRedirect]="{
          expectedId: workspace.id,
          requiredPermission: MemberPermission,
          type: 'workspace',
        }"
      >
        <router-outlet />
      </ng-container>
    }`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDetailComponent {
  workspaceId = input.required<string>();
  protected readonly MemberPermission = MemberPermission;
  router = inject(Router);
  workspaceRepositoryService = inject(WorkspaceRepositoryService);
  projectRepositoryService = inject(ProjectRepositoryService);
  sideNavStore = inject(SideNavStore);

  constructor() {
    effect((onCleanup) => {
      const workspaceId = this.workspaceId();
      this.projectRepositoryService.listRequest({ workspaceId }).then();
      onCleanup(() => this.projectRepositoryService.resetEntitySummaryList());
    });

    toObservable(this.workspaceRepositoryService.entityDetail)
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
        label: "workspace.general_title.workspace_list_projects",
        iconName: "lists",
        href: "projects",
        testId: "projects-link",
      },
    ]);
    this.sideNavStore.setSecondaryNavItems([
      {
        label: "workspace.general_title.workspace_members",
        iconName: "group",
        href: "members",
        testId: "members-link",
      },
      {
        label: "workspace.general_title.workspace_settings",
        iconName: "settings",
        href: "settings",
        testId: "settings-link",
      },
    ]);
  }
}
