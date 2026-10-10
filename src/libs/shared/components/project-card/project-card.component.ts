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

import { Component, inject, input } from "@angular/core";
import { TranslocoDirective } from "@jsverse/transloco";
import { MatIcon } from "@angular/material/icon";
import { ButtonAddComponent } from "@tenzu/shared/components/ui/button/button-add.component";
import {
  ProjectCreateDialog,
  ProjectCreateDialogData,
} from "@tenzu/shared/components/project-create-dialog/project-create-dialog";
import { matDialogConfig } from "@tenzu/utils/mat-config";
import { MatDialog } from "@angular/material/dialog";
import { WorkspaceSummary } from "@tenzu/repository/workspace/workspace.model";
import { ProjectSummary } from "@tenzu/repository/project/project.model";
import { CardBackdropDirective, CardComponent } from "@tenzu/shared/components/ui/card/card.component";

@Component({
  selector: "app-project-card",
  imports: [CardComponent, CardBackdropDirective, TranslocoDirective, MatIcon, ButtonAddComponent],
  template: `
    @let _name = name();
    @let _color = color();
    @let _description = description();
    @let _workspaceId = workspaceId();
    @if (!_name && !_description && !_color) {
      <app-card *transloco="let t">
        <span class="pb-2 pl-2">{{ t("component.project_card.create_first_project") }}</span>
        @if (_workspaceId) {
          <app-button-add
            class="ml-2"
            [iconOnly]="true"
            [level]="'tertiary'"
            [translocoKey]="'commons.project'"
            (click)="openCreateProject(_workspaceId)"
          />
        }
      </app-card>
    } @else {
      <app-card
        [name]="_name"
        [color]="_color"
        [logo]="logo()"
        [landingPage]="landingPage()"
        [description]="_description"
        [backdrop]="disabled()"
      >
        <mat-icon appCardBackdrop class="text-tertiary">lock</mat-icon>
      </app-card>
    }
  `,
  styles: ``,
})
export class ProjectCardComponent {
  readonly dialog = inject(MatDialog);

  workspaceId = input.required<WorkspaceSummary["id"]>();
  name = input<ProjectSummary["name"]>("");
  color = input<ProjectSummary["color"]>(0);
  logo = input<ProjectSummary["logo"]>(undefined);
  description = input<ProjectSummary["description"] | null>("");
  landingPage = input<string | null>("");
  disabled = input<boolean>(false);

  openCreateProject(workspaceId: WorkspaceSummary["id"]): void {
    const data: ProjectCreateDialogData = {
      workspaceId,
    };
    this.dialog.open(ProjectCreateDialog, {
      ...matDialogConfig,
      minWidth: 850,
      data: data,
    });
  }
}
