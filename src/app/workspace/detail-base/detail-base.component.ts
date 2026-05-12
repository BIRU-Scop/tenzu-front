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
import { BreadcrumbComponent } from "@tenzu/shared/components/breadcrumb";
import { PrimarySideNavComponent } from "@tenzu/shared/components/primary-side-nav";
import { Router, RouterOutlet } from "@angular/router";
import { WorkspaceRepositoryService } from "@tenzu/repository/workspace";
import { handleHttpError } from "@tenzu/utils/functions/http-error-handler";
@Component({
  selector: "app-detail-base",
  host: { class: "block h-full" },
  imports: [BreadcrumbComponent, PrimarySideNavComponent, RouterOutlet],
  template: `
    <app-primary-side-nav>
      <div class="flex flex-col h-full pt-2 pl-2 box-border">
        <app-breadcrumb class="shrink-0" />
        <div class="flex-1 min-h-0 mt-8"><router-outlet /></div>
      </div>
    </app-primary-side-nav>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailBaseComponent {
  workspaceId = input.required<string>();
  workspaceRepositoryService = inject(WorkspaceRepositoryService);
  router = inject(Router);

  constructor() {
    effect(() => {
      const workspaceId = this.workspaceId();
      const promise = this.workspaceRepositoryService.setup({ workspaceId });
      promise?.catch((error) => {
        handleHttpError(error, this.router, { context: "Workspace", message: "Could not load workspace." });
      });
    });
  }
}
