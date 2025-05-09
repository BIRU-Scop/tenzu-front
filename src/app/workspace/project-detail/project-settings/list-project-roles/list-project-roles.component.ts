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

import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from "@angular/core";
import { ProjectRolesRepositoryService } from "@tenzu/repository/project-roles";
import { MatCell, MatCellDef, MatColumnDef, MatRow, MatRowDef, MatTable } from "@angular/material/table";
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: "app-list-project-roles",
  imports: [MatTable, MatColumnDef, MatCell, MatCellDef, MatRow, MatRowDef, TranslocoDirective],
  template: `
    <mat-table [dataSource]="entitiesSummary()" *transloco="let t; prefix: 'project.settings.roles'">
      <ng-container matColumnDef="name">
        <mat-cell *matCellDef="let entity">{{ entity.name }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="totalMembers">
        <mat-cell *matCellDef="let entity">{{ entity.totalMembers }} {{ t("total_members") }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="editable">
        <mat-cell *matCellDef="let entity">{{ entity.editable ? t("editable") : t("not_editable") }}</mat-cell>
      </ng-container>
      <mat-row *matRowDef="let row; columns: columns()"></mat-row>/
    </mat-table>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListProjectRolesComponent implements OnInit {
  columns = signal(["name", "totalMembers", "editable"]);
  projectRolesRepositoryService = inject(ProjectRolesRepositoryService);
  entitiesSummary = this.projectRolesRepositoryService.entitiesSummary;
  projectId = input.required<string>();

  ngOnInit(): void {
    this.projectRolesRepositoryService.listRequest({ projectId: this.projectId() }).then();
  }
}
