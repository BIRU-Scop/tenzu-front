/*
 * Copyright (C) 2026 BIRU
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

import { Component, inject } from "@angular/core";
import ListTagsComponent from "./tags/list-tags.component";
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { TranslocoDirective } from "@jsverse/transloco";
import { PermissionOrRedirectDirective } from "@tenzu/directives/permission.directive";
import { ProjectRepositoryService } from "@tenzu/repository/project/project-repository.service";
import { ProjectPermissions } from "@tenzu/repository/permission/permission.model";

@Component({
  selector: "app-attributes",
  imports: [
    ListTagsComponent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    PermissionOrRedirectDirective,
    TranslocoDirective,
  ],
  template: `@let projectDetail = currentProjectDetail();
    @if (projectDetail) {
      <ng-container
        [appPermissionOrRedirect]="{
          requiredPermission: ProjectPermissions.MODIFY_PROJECT,
          expectedId: projectDetail.id,
          type: 'project',
        }"
        *transloco="let t"
      >
        <mat-expansion-panel class="flat-expansion" expanded>
          <mat-expansion-panel-header>
            <mat-panel-title> {{ t("project.settings.attributes.tags.title") }} </mat-panel-title>
          </mat-expansion-panel-header>
          <app-list-tags />
        </mat-expansion-panel>
      </ng-container>
    }`,
  styles: ``,
})
export default class AttributesComponent {
  protected readonly ProjectPermissions = ProjectPermissions;
  protected currentProjectDetail = inject(ProjectRepositoryService).entityDetail;
}
